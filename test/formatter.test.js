const {
  preprocessCode,
  postprocessCode,
} = require("../piyathonFormatter");

describe("Piyathon Formatter", () => {
  describe("preprocessCode", () => {
    test("should translate Thai keywords to English in code", () => {
      const input = 'ถ้า x > 0:\n    พิมพ์("Hello")';
      const expected = 'if x > 0:\n    print("Hello")';
      const result = preprocessCode(input);
      expect(result).toBe(expected);
      if (result !== expected) {
        console.log("Input:", input);
        console.log("Expected:", expected);
        console.log("Received:", result);
        console.log("Differences:");
        for (
          let i = 0;
          i < Math.max(expected.length, result.length);
          i++
        ) {
          if (expected[i] !== result[i]) {
            console.log(
              `Position ${i}: Expected '${expected[i]}', got '${result[i]}'`
            );
          }
        }
      }
    });

    test("should not translate keywords in string literals", () => {
      const input = 'พิมพ์("ถ้า และ หรือ")';
      const expected = 'print("ถ้า และ หรือ")';
      const result = preprocessCode(input);
      expect(result).toBe(expected);
      if (result !== expected) {
        console.log("Input:", input);
        console.log("Expected:", expected);
        console.log("Received:", result);
        console.log("Differences:");
        for (
          let i = 0;
          i < Math.max(expected.length, result.length);
          i++
        ) {
          if (expected[i] !== result[i]) {
            console.log(
              `Position ${i}: Expected '${expected[i]}', got '${result[i]}'`
            );
          }
        }
      }
    });

    test("should not translate keywords in comments", () => {
      const input = '# ถ้า และ หรือ\nพิมพ์("test")';
      const expected = '# ถ้า และ หรือ\nprint("test")';
      const result = preprocessCode(input);
      expect(result).toBe(expected);
      if (result !== expected) {
        console.log("Input:", input);
        console.log("Expected:", expected);
        console.log("Received:", result);
        console.log("Differences:");
        for (
          let i = 0;
          i < Math.max(expected.length, result.length);
          i++
        ) {
          if (expected[i] !== result[i]) {
            console.log(
              `Position ${i}: Expected '${expected[i]}', got '${result[i]}'`
            );
          }
        }
      }
    });

    test("should not translate keywords in docstrings", () => {
      const input = '"""ถ้า และ หรือ"""\nพิมพ์("test")';
      const expected = '"""ถ้า และ หรือ"""\nprint("test")';
      const result = preprocessCode(input);
      expect(result).toBe(expected);
      if (result !== expected) {
        console.log("Input:", input);
        console.log("Expected:", expected);
        console.log("Received:", result);
        console.log("Differences:");
        for (
          let i = 0;
          i < Math.max(expected.length, result.length);
          i++
        ) {
          if (expected[i] !== result[i]) {
            console.log(
              `Position ${i}: Expected '${expected[i]}', got '${result[i]}'`
            );
          }
        }
      }
    });

    test("should handle mixed code correctly", () => {
      const input = `
# ถ้า condition is true
ถ้า x > 0:  # ถ้า comment
    พิมพ์("ถ้า in string")
    """
    ถ้า in docstring
    multiple lines
    """
    y = True และ False
`;
      const expected = `
# ถ้า condition is true
if x > 0:  # ถ้า comment
    print("ถ้า in string")
    """
    ถ้า in docstring
    multiple lines
    """
    y = True and False
`;
      const result = preprocessCode(input);
      expect(result).toBe(expected);
      if (result !== expected) {
        console.log("Input:", input);
        console.log("Expected:", expected);
        console.log("Received:", result);
        console.log("Differences:");
        for (
          let i = 0;
          i < Math.max(expected.length, result.length);
          i++
        ) {
          if (expected[i] !== result[i]) {
            console.log(
              `Position ${i}: Expected '${expected[i]}', got '${result[i]}'`
            );
          }
        }
      }
    });
  });

  describe("postprocessCode", () => {
    test("should translate English keywords to Thai in code", () => {
      const input = 'if x > 0:\n    print("Hello")';
      const expected = 'ถ้า x > 0:\n    พิมพ์("Hello")';
      const result = postprocessCode(input);
      expect(result).toBe(expected);
      if (result !== expected) {
        console.log("Input:", input);
        console.log("Expected:", expected);
        console.log("Received:", result);
        console.log("Differences:");
        for (
          let i = 0;
          i < Math.max(expected.length, result.length);
          i++
        ) {
          if (expected[i] !== result[i]) {
            console.log(
              `Position ${i}: Expected '${expected[i]}', got '${result[i]}'`
            );
          }
        }
      }
    });

    test("should not translate keywords in string literals", () => {
      const input = 'print("if and or")';
      const expected = 'พิมพ์("if and or")';
      const result = postprocessCode(input);
      expect(result).toBe(expected);
      if (result !== expected) {
        console.log("Input:", input);
        console.log("Expected:", expected);
        console.log("Received:", result);
        console.log("Differences:");
        for (
          let i = 0;
          i < Math.max(expected.length, result.length);
          i++
        ) {
          if (expected[i] !== result[i]) {
            console.log(
              `Position ${i}: Expected '${expected[i]}', got '${result[i]}'`
            );
          }
        }
      }
    });

    test("should not translate keywords in comments", () => {
      const input = '# if and or\nprint("test")';
      const expected = '# if and or\nพิมพ์("test")';
      const result = postprocessCode(input);
      expect(result).toBe(expected);
      if (result !== expected) {
        console.log("Input:", input);
        console.log("Expected:", expected);
        console.log("Received:", result);
        console.log("Differences:");
        for (
          let i = 0;
          i < Math.max(expected.length, result.length);
          i++
        ) {
          if (expected[i] !== result[i]) {
            console.log(
              `Position ${i}: Expected '${expected[i]}', got '${result[i]}'`
            );
          }
        }
      }
    });

    test("should not translate keywords in docstrings", () => {
      const input = '"""if and or"""\nprint("test")';
      const expected = '"""if and or"""\nพิมพ์("test")';
      const result = postprocessCode(input);
      expect(result).toBe(expected);
      if (result !== expected) {
        console.log("Input:", input);
        console.log("Expected:", expected);
        console.log("Received:", result);
        console.log("Differences:");
        for (
          let i = 0;
          i < Math.max(expected.length, result.length);
          i++
        ) {
          if (expected[i] !== result[i]) {
            console.log(
              `Position ${i}: Expected '${expected[i]}', got '${result[i]}'`
            );
          }
        }
      }
    });

    test("should handle mixed code correctly", () => {
      const input = `
# if condition is true
if x > 0:  # if comment
    print("if in string")
    """
    if in docstring
    multiple lines
    """
    y = True and False
`;
      const expected = `
# if condition is true
ถ้า x > 0:  # if comment
    พิมพ์("if in string")
    """
    if in docstring
    multiple lines
    """
    y = จริง และ เท็จ
`;
      const result = postprocessCode(input);
      expect(result).toBe(expected);
      if (result !== expected) {
        console.log("Input:", input);
        console.log("Expected:", expected);
        console.log("Received:", result);
        console.log("Differences:");
        for (
          let i = 0;
          i < Math.max(expected.length, result.length);
          i++
        ) {
          if (expected[i] !== result[i]) {
            console.log(
              `Position ${i}: Expected '${expected[i]}', got '${result[i]}'`
            );
          }
        }
      }
    });
  });

  describe("roundtrip conversion", () => {
    test("should preserve code after preprocessing and postprocessing", () => {
      const original = `
# ถ้า condition is true
ถ้า x > 0:  # ถ้า comment
    พิมพ์("ถ้า in string")
    """
    ถ้า in docstring
    multiple lines
    """
    y = จริง และ เท็จ
`;
      const preprocessed = preprocessCode(original);
      const postprocessed = postprocessCode(preprocessed);
      expect(postprocessed).toBe(original);
      if (postprocessed !== original) {
        console.log("Original:", original);
        console.log("Preprocessed:", preprocessed);
        console.log("Postprocessed:", postprocessed);
        console.log("Differences:");
        for (
          let i = 0;
          i < Math.max(original.length, postprocessed.length);
          i++
        ) {
          if (original[i] !== postprocessed[i]) {
            console.log(
              `Position ${i}: Expected '${original[i]}', got '${postprocessed[i]}'`
            );
          }
        }
      }
    });
  });
});
