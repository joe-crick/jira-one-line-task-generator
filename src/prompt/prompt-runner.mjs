import inquirer from "inquirer";
import { editor as editorPrompt } from "@inquirer/prompts";
import { assoc, cond, conj, ELSE, empty$, eq, map, min, not, notEq, or, hasOwnProp } from "ljsp-core";
import { atf } from "../lib/atf.mjs";

/**
 * @template T
 * @typedef {Object} PromptSpec
 * @property {"select"|"input"|"editor"} kind - Type of prompt
 * @property {string} name - State property to store the answer
 * @property {string | ((state: T) => string)} message - Prompt message
 * @property {Array<string|{name:string,value:any}> | ((state:T)=>Array<string|{name:string,value:any}>) } [choices] - Options for select prompts
 * @property {boolean} [addCancel] - Whether to include a cancel option in select prompts
 * @property {any} [cancelValue] - Value to use if cancelled
 * @property {(state:T,value:any)=>T} [onApply] - Callback to update state with selected value
 */

/** @enum {string} */
export const kind = {
  select: "select",
  input: "input",
  editor: "editor",
};

/** @type {string} */
const TYPE_STRING = "string";
/** @type {string} */
const TYPE_FUNCTION = "function";

/** @enum {string} */
const promptType = { select: "list", input: "input" };

/** @type {string} */
const CANCEL_LABEL = "(Cancel)";
/** @type {string} */
const EMPTY_STRING = "";

/** @type {string} */
const PROP_CANCEL_VALUE = "cancelValue";
/** @type {string} */
const ERROR_UNKNOWN_KIND_PREFIX = "Unknown prompt kind: ";

const SIGINT = "SIGINT";

/**
 * Runs a sequence of prompts and returns the updated state.
 * If the user cancels at any point, sets `cancelled: true`.
 * @template T
 * @param {T} initialState Initial state object to pass through prompts
 * @returns {(specs: PromptSpec<T>[]) => Promise<T & { cancelled: boolean }>}
 */
export const promptRunner = (initialState) => async (specs) => {
  const initState = assoc(initialState, { cancelled: false });

  // Prevent process from exiting on SIGINT (Ctrl+C) so we can treat it as cancellation
  const onSigint = () => {
    // no-op handler to override default exit behavior
  };
  process.on(SIGINT, onSigint);
  try {
    return await runStep(initState, specs);
  } finally {
    process.off(SIGINT, onSigint);
  }
};

/**
 * Recursive step that processes one spec and recurses on the rest.
 * @template T
 * @param {T & { cancelled?: boolean }} state Current accumulated state
 * @param {PromptSpec<T>[]} specs Remaining prompts to process
 * @returns {Promise<T & { cancelled?: boolean }>}
 */
async function runStep(state, specs) {
  if (or(empty$(specs), state?.cancelled)) return state;

  const [spec, ...rest] = specs;
  const message = getMessage(spec, state);
  const cancelValue = getCancelValue(spec);

  try {
    // prettier-ignore
    const nextState = await atf(
      { spec, state, message, cancelValue },
      async (ctx) => await getSelectedValue(spec, ctx),
      (value) => getNextState(value, cancelValue, spec, state),
    )
    return runStep(nextState, rest);
  } catch (e) {
    // Interruption (Ctrl+C) or editor closed -> treat as cancel
    return assoc(state, { cancelled: true });
  }
}

/**
 * Computes the next state from the selected value.
 * @template T
 * @param {any} value Selected value
 * @param {any} cancelValue Value indicating cancellation
 * @param {PromptSpec<T>} spec Current prompt spec
 * @param {T} state Current state
 * @returns {T & { cancelled?: boolean }}
 */
function getNextState(value, cancelValue, spec, state) {
  // prettier-ignore
  return cond(
    eq(value, cancelValue), () => ({ cancelled: true }),
    ELSE, () => (spec.onApply ? spec.onApply(state, value) : assoc(state, {[spec.name]: value }))
  );
}

/**
 * Dispatches to the correct prompt handler based on the spec kind.
 * @template T
 * @param {PromptSpec<T>} spec
 * @param {{ spec: PromptSpec<T>, state: T, message: string, cancelValue: any }} ctx
 * @returns {Promise<any>}
 */
function getSelectedValue(spec, ctx) {
  // prettier-ignore
  return cond(
    () => isSelect(spec), () => handleSelect(ctx),
    () => isInput(spec), () => handleInput(ctx),
    () => isEditor(spec), () => handleEditor(ctx),
    ELSE, () => handleUnknown(spec)
  );
}

/**
 * Handles select/list prompts
 * @template T
 * @param {{spec: PromptSpec<T>, state: T, message: string, cancelValue: any}} ctx
 */
async function handleSelect({ spec, state, message, cancelValue }) {
  // prettier-ignore
  return atf(
    getChoiceInput(spec, state),
    (choiceInput) => withCancel(normaliseChoices(choiceInput), notEq(spec.addCancel, false)),
    async (choices) => await inquirer.prompt([
      {
        type: promptType.select,
        name: spec.name,
        message,
        choices,
        pageSize: min(10, spec.pageSize ?? choices.length),
        loop: false,
      },
    ]),
    (answer) => answer ? answer[spec.name] : cancelValue
  )
}

/**
 * Handles input prompts
 * @template T
 * @param {{spec: PromptSpec<T>, message:string, cancelValue:any}} ctx
 */
async function handleInput({ spec, message, cancelValue }) {
  // prettier-ignore
  return atf(
    await inquirer.prompt([{ type: promptType.input, name: spec.name, message }]),
    (answer) => answer ? answer[spec.name] : cancelValue
  )
}

/**
 * Handles editor prompts
 * @param {{message:string}} ctx
 */
async function handleEditor({ message }) {
  return editorPrompt({ message });
}

/** @param {PromptSpec<any>} spec */
function handleUnknown(spec) {
  throw new Error(`${ERROR_UNKNOWN_KIND_PREFIX}${spec.kind}`);
}

/** @param {PromptSpec<any>} spec */
function isSelect(spec) {
  return eq(spec.kind, kind.select);
}

/** @param {PromptSpec<any>} spec */
function isInput(spec) {
  return eq(spec.kind, kind.input);
}

/** @param {PromptSpec<any>} spec */
function isEditor(spec) {
  return eq(spec.kind, kind.editor);
}

/**
 * Resolves the message from spec (string or function)
 * @template T
 * @param {PromptSpec<T>} spec
 * @param {T} state
 * @returns {string}
 */
function getMessage(spec, state) {
  return eq(typeof spec.message, TYPE_FUNCTION) ? spec.message(state) : spec.message;
}

/**
 * Returns the cancel value defined in the spec
 * @param {PromptSpec<any>} spec
 * @returns {any}
 */
function getCancelValue(spec) {
  return hasOwnProp(spec, PROP_CANCEL_VALUE) ? spec.cancelValue : EMPTY_STRING;
}

/**
 * Returns choices array from spec (function or array)
 * @template T
 * @param {PromptSpec<T>} spec
 * @param {T} state
 * @returns {Array<string|{name:string,value:any}>}
 */
function getChoiceInput(spec, state) {
  return eq(typeof spec.choices, TYPE_FUNCTION) ? spec.choices(state) : spec.choices || [];
}

/**
 * Normalise array of choices: strings -> {name,value}
 * @param {Array<string | { name: string; value: any }>} items
 * @returns {Array<{name:string,value:any}>}
 */
function normaliseChoices(items) {
  return map((item) => (eq(typeof item, TYPE_STRING) ? { name: item, value: item } : item), items);
}

/**
 * Adds a Cancel option to list choices
 * @param {Array<{name:string,value:any}>} choices
 * @param {boolean} addCancel
 * @returns {Array<{name:string,value:any}>}
 */
function withCancel(choices, addCancel) {
  // prettier-ignore
  return not(addCancel)
    ? choices
    : conj(choices, new inquirer.Separator(), { name: CANCEL_LABEL, value: EMPTY_STRING });
}
