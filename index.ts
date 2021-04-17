import type { IncomingMessage, ServerResponse } from "http";

interface PermissionsPolicyOptions {
  features: Record<string, string[]>;
}

const reserveredKeywords = new Set(["self", "src", "*", "none"]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && !Array.isArray(value) && value !== null;
}

function isQuoted(value: string) {
  return /^".*"$/.test(value);
}

const dashify = (str: string): string =>
  str.replace(/[A-Z]/g, (capitalLetter) => "-" + capitalLetter.toLowerCase());

function getHeaderValue(options: unknown): string {
  if (!isPlainObject(options)) {
    throw new Error(
      "permissionsPolicy must be called with an object argument. See the documentation.",
    );
  }

  const { features } = options;
  if (!isPlainObject(features)) {
    throw new Error(
      'permissionsPolicy must have a single key, "features", which is an object of features. See the documentation.',
    );
  }

  const result = Object.entries(features)
    .map(([featureKeyCamelCase, featureValue]) => {
      if (!Array.isArray(featureValue) || featureValue.length === 0) {
        throw new Error(
          `The value of the "${featureKeyCamelCase}" feature must be a non-empty array of strings.`,
        );
      }

      const allowedValuesSeen: Set<string> = new Set();

      featureValue.forEach((allowedValue) => {
        if (typeof allowedValue !== "string") {
          throw new Error(
            `The value of the "${featureKeyCamelCase}" feature contains a non-string, which is not supported.`,
          );
        } else if (allowedValuesSeen.has(allowedValue)) {
          throw new Error(
            `The value of the "${featureKeyCamelCase}" feature contains duplicates, which it shouldn't.`,
          );
        } else if (allowedValue === "'self'") {
          throw new Error("self must not be quoted.");
        } else if (allowedValue === "'none'") {
          throw new Error("none must not be quoted.");
        } else if (allowedValue === "'src'") {
          throw new Error("src must not be quoted.");
        } else if (
          !reserveredKeywords.has(allowedValue) &&
          !isQuoted(allowedValue)
        ) {
          throw new Error("values beside reserved keywords must be quoted.");
        }
        allowedValuesSeen.add(allowedValue);
      });

      if (featureValue.length > 1) {
        if (allowedValuesSeen.has("*")) {
          throw new Error(
            `The value of the "${featureKeyCamelCase}" feature cannot contain * and other values.`,
          );
        } else if (allowedValuesSeen.has("'none'")) {
          throw new Error(
            `The value of the "${featureKeyCamelCase}" feature cannot contain 'none' and other values.`,
          );
        }
      }

      const featureKeyDashed = dashify(featureKeyCamelCase);
      const featureValuesUnion = featureValue.join(" ");
      return `${featureKeyDashed}=(${featureValuesUnion})`;
    })
    .join(", ");

  if (result.length === 0) {
    throw new Error("At least one feature is required.");
  }

  return result;
}

export default function permissionsPolicy(
  options: Readonly<PermissionsPolicyOptions>,
) {
  const headerValue = getHeaderValue(options);
  return (_req: IncomingMessage, res: ServerResponse, next: () => void) => {
    res.setHeader("Permissions-Policy", headerValue);
    next();
  };
}
