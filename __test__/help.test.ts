import * as path from "path";
import { helper } from "../src/helper";

const resolveMock = jest.spyOn(path, 'resolve');
// Declare resolve here to prevent StackOverflow
const posixResolve = path.posix.resolve;
const win32Resolve = path.win32.resolve;


describe("Test helper", function () {
  beforeEach(() => {
    resolveMock.mockClear();
  });

  it(`validFileName`, async () => {
    const testCases = [
      {
        fileName: "some test file.txt",
        expected: true,
      },
      {
        fileName: "some ^test file.txt",
        expected: true,
      },
      {
        fileName: "some :test file.txt",
        expected: false,
      },
      {
        fileName: "some \\test file.txt",
        expected: false,
      },
      {
        fileName: "some |test file.txt",
        expected: false,
      },
      {
        fileName: "some /test file.txt",
        expected: false,
      },
      {
        fileName: "some *test file.txt",
        expected: false,
      },
      {
        fileName: "some ?test file.txt",
        expected: false,
      },
      {
        fileName: "some <test file.txt",
        expected: false,
      },
      {
        fileName: "some >test file.txt",
        expected: false,
      },
      {
        fileName: "com9.txt",
        expected: false,
      },
      {
        fileName: "nul.txt",
        expected: false,
      },
      {
        fileName: "prn.txt",
        expected: false,
      },
      {
        fileName: "con.txt",
        expected: false,
      },
      {
        fileName: "lpt5.txt",
        expected: false,
      },
    ];

    for (const testCase of testCases) {
      expect(await helper.validFileName(testCase.fileName)).toBe(
        testCase.expected
      );
    }
  });
  it(`Compare versions`, async () => {
    const testCases = [
      {
        version1: "2.9.12",
        version2: "2.9.12",
        expected: 0,
      },
      {
        version1: "2.9.12",
        version2: "2.9.13",
        expected: -1,
      },
      {
        version1: "2.9.13",
        version2: "2.9.12",
        expected: 1,
      },
      {
        version1: "2.10.6",
        version2: "2.9.12",
        expected: 1,
      },
      {
        version1: "3.10.6",
        version2: "2.11.8",
        expected: 1,
      },
      {
        version1: "2.10.6",
        version2: "3.11.8",
        expected: -1,
      },
      {
        version1: "2",
        version2: "2.1",
        expected: -1,
      },
      {
        version1: "2.1",
        version2: "2",
        expected: 1,
      },
      {
        version1: "3",
        version2: "2",
        expected: 1,
      },
      {
        version1: "2",
        version2: "2",
        expected: 0,
      },
      {
        version1: "3.11.8",
        version2: "3.11.8-a",
        expected: 0,
      },
      {
        version1: "2",
        version2: "",
        expected: -2,
      },
      {
        version1: "3.a.8",
        version2: "3.11.8",
        expected: -1,
      },
    ];

    for (const testCase of testCases) {
      expect(
        await helper.versionCompare(testCase.version1, testCase.version2)
      ).toBe(testCase.expected);
    }
  });

  test.each([
    // Equality
    ["/tmp/this/is/a/test", "/tmp/this/is/a/test", true],
    ["/tmp/test", "/tmp/test///", true],

    // Subdirectories
    ["/tmp", "/tmp/test", true],
    ["/tmp/", "/tmp/test", true],
    ["/tmp/", "/tmp/..test", true],
    ["/tmp/test", "/tmp/", false],

    // Different directories
    ["/tmp/", "/tmp/../test", false],
    ["/tmp/te", "/tmp/test", false],
    ["a", "/a", false],
    ["/a/b", "/b/c", false],
  ])(
    "isSubdirectoryOrEqual with POSIX paths (is %s the parent of %s?)",
    (path1, path2, expected) => {
      resolveMock.mockImplementation((...args) => posixResolve(...args));
      (path as any).sep = path.posix.sep;
      expect(helper.isSubdirectoryOrEqual(path1, path2)).toBe(
        expected
      );
    }
  );

  test.each([
    ["C:\\Users\\User\\", "C:\\Users\\User\\", true],
    ["D:\\Users\\User\\", "C:\\Users\\User\\", false],
    ["C:\\Users\\Userr\\", "C:\\Users\\User\\", false],
    ["C:\\Users\\User\\", "C:\\Users\\User\\.config\\joplin-desktop", true],
  ])(
    "isSubdirectoryOrEqual with Windows paths (is %s the parent of %s?)",
    (path1, path2, expected) => {
      resolveMock.mockImplementation((...args) => win32Resolve(...args));
      (path as any).sep = path.win32.sep;
      expect(helper.isSubdirectoryOrEqual(path1, path2)).toBe(
        expected
      );
    }
  );
});
