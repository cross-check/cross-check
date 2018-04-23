import { ValidationBuilder, validators } from "@cross-check/dsl";
import { TypeFunction, primitive, primitiveLabel } from "copilot-schema";

function isValidDate(input: string): boolean {
  let parsed = Date.parse(input);
  if (isNaN(parsed)) return false;
  return input === new Date(parsed).toISOString();
}

export const isDate: ValidationBuilder<string> = validators.is(
  (v: string): v is string => isValidDate(v),
  "iso-date"
)();

export const ISODate: TypeFunction = primitive(
  isDate,
  primitiveLabel({ name: "Date" }, "ISO Date", "Date")
);