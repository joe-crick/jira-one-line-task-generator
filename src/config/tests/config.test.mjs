import { beforeEach, describe, expect, it, vi } from "vitest";
import * as fs from "fs/promises";
import * as configModule from "../config.mjs";
import { constants as fsConstants } from "fs";

vi.mock("fs/promises");
vi.mock("../lib/atf.mjs", () => ({
  atf: vi.fn((value, ...fns) => {
    // simple passthrough mock for testing
    return fns.reduce((acc, fn) => fn(acc), value);
  }),
}));

describe("config module", () => {
  beforeEach(() => {
    configModule.setRuntimeConfig(null); // reset runtimeConfig before each test
    vi.clearAllMocks();
  });

  describe("configExists", () => {
    it("returns true if file exists", async () => {
      fs.access.mockResolvedValue();
      const result = await configModule.configExists();
      expect(result).toBe(true);
      expect(fs.access).toHaveBeenCalledWith(".task-gen.conf", fsConstants.F_OK);
    });

    it("returns false if file does not exist", async () => {
      fs.access.mockRejectedValue(new Error("not found"));
      const result = await configModule.configExists();
      expect(result).toBe(false);
    });
  });

  describe("setRuntimeConfig / getRuntimeConfig", () => {
    it("sets and retrieves config", () => {
      const cfg = { jiraProjects: ["A"], jiraBaseUri: "uri", jiraAuth: "auth", activeDevelopersByProject: {} };
      configModule.setRuntimeConfig(cfg);
      expect(configModule.getRuntimeConfig()).toEqual(cfg);
    });

    it("returns default config if none set", () => {
      expect(configModule.getRuntimeConfig()).toEqual({
        jiraProjects: [],
        jiraBaseUri: "",
        jiraAuth: "",
        activeDevelopersByProject: {},
      });
    });

    it("reset config with null", () => {
      configModule.setRuntimeConfig(null);
      expect(configModule.getRuntimeConfig()).toEqual({
        jiraProjects: [],
        jiraBaseUri: "",
        jiraAuth: "",
        activeDevelopersByProject: {},
      });
    });
  });

  describe("saveConfig", () => {
    it("writes config to file and updates runtimeConfig", async () => {
      const cfg = { jiraProjects: ["Y"], jiraBaseUri: "uri", jiraAuth: "auth", activeDevelopersByProject: {} };
      fs.writeFile.mockResolvedValue();
      await configModule.saveConfig(cfg);
      expect(fs.writeFile).toHaveBeenCalledWith(".task-gen.conf", JSON.stringify(cfg, null, 2), "utf8");
      expect(configModule.getRuntimeConfig()).toEqual(cfg);
    });
  });
});
