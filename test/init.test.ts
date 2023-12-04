import {
  copyBuildConfigIfNotExists,
  getUserDomainPreference,
  init_repository,
  init_s3,
  saveAndLogConfiguration,
} from "../bin/cli/actions/init";
import { TOOL_NAME } from "../bin/cli/shared/constants";
import { HostingConfiguration } from "../bin/cli/shared/types";
const prompts = require("prompts");
import * as fs from "fs";

describe("getUserDomainPreference", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prompts.inject([]); // Clear any injected values
  });

  test("Based on user preferences, it should return both a domainName and a hostedZoneId.", async () => {
    const mockConfig: HostingConfiguration = {
      repoUrl: "https://github.com/USERNAME/REPOSITORY.git",
      branchName: "main",
      framework: "vuejs",
      domainName: "example.com",
    };

    prompts.inject(["yes", "example.com", "current", "mockHostedZoneId"]);

    const result = await getUserDomainPreference(mockConfig);
    expect(result).toEqual({
      domainName: "example.com",
      hostedZoneId: "mockHostedZoneId",
    });
  });

  test("Based on user preferences, it should return a domainName without a hostedZoneId", async () => {
    const mockConfig: HostingConfiguration = {
      repoUrl: "https://github.com/USERNAME/REPOSITORY.git",
      branchName: "main",
      framework: "vuejs",
      domainName: "example.com",
    };

    prompts.inject(["yes", "example.com", "another"]);

    const result = await getUserDomainPreference(mockConfig);
    expect(result).toEqual({
      domainName: "example.com",
      hostedZoneId: undefined,
    });
  });

  test("Based on user preferences, it should not return a domainName or a hostedZoneId.", async () => {
    const mockConfig: HostingConfiguration = {
      repoUrl: "https://github.com/USERNAME/REPOSITORY.git",
      branchName: "main",
      framework: "vuejs",
      domainName: "example.com",
    };

    prompts.inject(["no"]);

    const result = await getUserDomainPreference(mockConfig);
    expect(result).toEqual({
      domainName: undefined,
      hostedZoneId: undefined,
    });
  });
});

// Mock the necessary functions and modules
jest.mock("fs", () => {
  const actualFs = jest.requireActual("fs");
  return {
    ...actualFs,
    existsSync: jest.fn(),
    mkdirSync: jest.fn(),
    copyFileSync: jest.fn(),
    writeFileSync: jest.fn( x => {}),
  };
});

describe("copyBuildConfigIfNotExists", () => {
  let existsSyncSpy: jest.SpyInstance;
  let mkdirSyncSpy: jest.SpyInstance;
  let copyFileSyncSpy: jest.SpyInstance;

  beforeEach(() => {
    existsSyncSpy = jest.spyOn(fs, "existsSync");
    mkdirSyncSpy = jest.spyOn(fs, "mkdirSync");
    copyFileSyncSpy = jest.spyOn(fs, "copyFileSync");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("copyBuildConfigIfNotExists", () => {
    let existsSyncSpy: jest.SpyInstance;
    let mkdirSyncSpy: jest.SpyInstance;
    let copyFileSyncSpy: jest.SpyInstance;

    let exitSpy: jest.SpyInstance;

    beforeEach(() => {
      existsSyncSpy = jest.spyOn(fs, "existsSync");
      mkdirSyncSpy = jest.spyOn(fs, "mkdirSync");
      copyFileSyncSpy = jest.spyOn(fs, "copyFileSync");
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should create directory and copy file if they do not exist", () => {
      existsSyncSpy.mockReturnValueOnce(false).mockReturnValueOnce(false);

      copyBuildConfigIfNotExists("sampleFile.txt");

      expect(mkdirSyncSpy).toHaveBeenCalledTimes(1);
      expect(copyFileSyncSpy).toHaveBeenCalledTimes(1);
    });

    it("should not create directory if it already exists", () => {
      existsSyncSpy.mockReturnValueOnce(true).mockReturnValueOnce(false);

      copyBuildConfigIfNotExists("sampleFile.txt");

      expect(mkdirSyncSpy).not.toBeCalled();
      expect(copyFileSyncSpy).toBeCalledWith(
        expect.any(String),
        expect.any(String)
      );
    });

    it("should not copy file if it already exists", () => {
      existsSyncSpy.mockReturnValue(true);

      copyBuildConfigIfNotExists("sampleFile.txt");

      expect(mkdirSyncSpy).not.toBeCalled();
      expect(copyFileSyncSpy).not.toBeCalled();
    });
  });
});

describe("saveAndLogConfiguration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should save configuration, log messages, and exit", () => {
    const newHostingConfiguration = {
      repoUrl: "https://github.com/USERNAME/REPOSITORY.git",
      branchName: "main",
      framework: "vuejs",
      domainName: "example.com",
    };

    saveAndLogConfiguration(newHostingConfiguration);

    // Verify that fs.writeFileSync is called
    expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
  });
});

describe("init_repository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("no domain name", async () => {
    prompts.inject([
      "https://github.com/myuser/myrepository.git",
      "dev",
      "nodejs",
      "no",
    ]);

    // Mock file system functions
    //fs.existsSync.mockReturnValue(false); // Configuration file does not exist

    // Mock file system functions
    const existsSyncSpy = jest.spyOn(fs, "existsSync");
    const writeFileSyncSpy = jest.spyOn(fs, "writeFileSync");

    existsSyncSpy.mockReturnValue(false); // Mock existsSync to return false

    // Call the function
    await init_repository();

    //it should be called 3 times: once at first, once before copying the yml file and once for
    expect(existsSyncSpy).toHaveBeenCalledTimes(3);

    expect(existsSyncSpy).toHaveBeenCalledWith(
      expect.stringContaining(`${TOOL_NAME}/${TOOL_NAME}-config.json`)
    );

    expect(existsSyncSpy).toHaveBeenCalledWith(
      expect.stringContaining(`${TOOL_NAME}/${TOOL_NAME}-build.yml`)
    );

    expect(existsSyncSpy).toHaveBeenCalledWith(
      expect.stringContaining(`${TOOL_NAME}`)
    );

    // Assert that saveAndLogConfiguration was called with the correct input
    expect(writeFileSyncSpy).toHaveBeenCalledTimes(1);
    expect.objectContaining({
      repoUrl: "https://github.com/myuser/myrepository.git",
      branchName: "dev",
      framework: "nodejs",
    });

    expect.not.objectContaining({
      domainName: expect.anything(),
      hostedZoneId: expect.anything(),
      
    });
  });

  it("with domain name", async () => {
    prompts.inject([
      "https://github.com/myuser/myrepository.git",
      "dev",
      "nodejs",
      "yes",
      "example.com",
      "another",
    ]);

    // Mock file system functions
    const existsSyncSpy = jest.spyOn(fs, "existsSync");
    const writeFileSyncSpy = jest.spyOn(fs, "writeFileSync");

    existsSyncSpy.mockReturnValue(false); // Mock existsSync to return false

    // Call the function
    await init_repository();

    //it should be called 3 times: once at first, once before copying the yml file and once for
    expect(existsSyncSpy).toHaveBeenCalledTimes(3);

    expect(existsSyncSpy).toHaveBeenCalledWith(
      expect.stringContaining(`${TOOL_NAME}/${TOOL_NAME}-config.json`)
    );

    expect(existsSyncSpy).toHaveBeenCalledWith(
      expect.stringContaining(`${TOOL_NAME}/${TOOL_NAME}-build.yml`)
    );

    expect(existsSyncSpy).toHaveBeenCalledWith(
      expect.stringContaining(`${TOOL_NAME}`)
    );

    // Assert that saveAndLogConfiguration was called with the correct input
    expect(writeFileSyncSpy).toHaveBeenCalledTimes(1);
    expect.objectContaining({
      repoUrl: "https://github.com/myuser/myrepository.git",
      branchName: "dev",
      framework: "nodejs",
      domainName: "example.com",
    });

    expect.not.objectContaining({
      hostedZoneId: expect.anything(),
    });
  });

  it("with domain name & authoritative DNS server on AWS", async () => {
    prompts.inject([
      "https://github.com/myuser/myrepository.git",
      "dev",
      "nodejs",
      "yes",
      "example.com",
      "current",
      "myHostedZoneId",
    ]);

    // Mock file system functions
    const existsSyncSpy = jest.spyOn(fs, "existsSync");
    const writeFileSyncSpy = jest.spyOn(fs, "writeFileSync");

    existsSyncSpy.mockReturnValue(false); // Mock existsSync to return false

    // Call the function
    await init_repository();

    //it should be called 3 times: once at first, once before copying the yml file and once for
    expect(existsSyncSpy).toHaveBeenCalledTimes(3);

    expect(existsSyncSpy).toHaveBeenCalledWith(
      expect.stringContaining(`${TOOL_NAME}/${TOOL_NAME}-config.json`)
    );

    expect(existsSyncSpy).toHaveBeenCalledWith(
      expect.stringContaining(`${TOOL_NAME}/${TOOL_NAME}-build.yml`)
    );

    expect(existsSyncSpy).toHaveBeenCalledWith(
      expect.stringContaining(`${TOOL_NAME}`)
    );

    // Assert that saveAndLogConfiguration was called with the correct input
    expect(writeFileSyncSpy).toHaveBeenCalledTimes(1);
    expect.objectContaining({
      repoUrl: "https://github.com/myuser/myrepository.git",
      branchName: "dev",
      framework: "nodejs",
      domainName: "example.com",
      hostedZoneId: "myHostedZoneId",
    });
  });
});

describe("s3_repository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("no folder path, no domain name", async () => {
    prompts.inject([
      "myBucketName",
      ""
    ]);

    // Mock file system functions
    //fs.existsSync.mockReturnValue(false); // Configuration file does not exist

    // Mock file system functions
    const existsSyncSpy = jest.spyOn(fs, "existsSync");
    const writeFileSyncSpy = jest.spyOn(fs, "writeFileSync");

    existsSyncSpy.mockReturnValue(false); // Mock existsSync to return false

    // Call the function
    await init_s3();

    //it should be called 3 times: once at first, once before copying the yml file and once for
    expect(existsSyncSpy).toHaveBeenCalledTimes(3);

    expect(existsSyncSpy).toHaveBeenCalledWith(
      expect.stringContaining(`${TOOL_NAME}/${TOOL_NAME}-config.json`)
    );

    expect(existsSyncSpy).toHaveBeenCalledWith(
      expect.stringContaining(`${TOOL_NAME}/${TOOL_NAME}-build.yml`)
    );

    expect(existsSyncSpy).toHaveBeenCalledWith(
      expect.stringContaining(`${TOOL_NAME}`)
    );

    // Assert that saveAndLogConfiguration was called with the correct input
    expect(writeFileSyncSpy).toHaveBeenCalledTimes(1);
    expect.objectContaining({
      s3bucket: "myBucketName",
      s3path: ""
    });

    expect.not.objectContaining({
      domainName: expect.anything(),
      hostedZoneId: expect.anything(),
      
    });
  });

  it("with folder path, no domain name", async () => {
    prompts.inject([
      "myBucketName",
      "test"
    ]);

    // Mock file system functions
    //fs.existsSync.mockReturnValue(false); // Configuration file does not exist

    // Mock file system functions
    const existsSyncSpy = jest.spyOn(fs, "existsSync");
    const writeFileSyncSpy = jest.spyOn(fs, "writeFileSync");

    existsSyncSpy.mockReturnValue(false); // Mock existsSync to return false

    // Call the function
    await init_s3();

    //it should be called 3 times: once at first, once before copying the yml file and once for
    expect(existsSyncSpy).toHaveBeenCalledTimes(3);

    expect(existsSyncSpy).toHaveBeenCalledWith(
      expect.stringContaining(`${TOOL_NAME}/${TOOL_NAME}-config.json`)
    );

    expect(existsSyncSpy).toHaveBeenCalledWith(
      expect.stringContaining(`${TOOL_NAME}/${TOOL_NAME}-build.yml`)
    );

    expect(existsSyncSpy).toHaveBeenCalledWith(
      expect.stringContaining(`${TOOL_NAME}`)
    );

    // Assert that saveAndLogConfiguration was called with the correct input
    expect(writeFileSyncSpy).toHaveBeenCalledTimes(1);
    expect.objectContaining({
      s3bucket: "myBucketName",
      s3path: "test"
    });

    expect.not.objectContaining({
      domainName: expect.anything(),
      hostedZoneId: expect.anything(),
      
    });
  });

});
