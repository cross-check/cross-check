import { ValidationBuilder, validators } from "@cross-check/dsl";
import { Dict, Option, assert, dict, entries, unknown } from "ts-std";
import { DictionaryDescriptor, RecordDescriptor } from "./descriptor";
import { isRequired } from "./required";
import { AbstractType, Type } from "./value";

export type AbstractDictionaryDescriptor =
  | DictionaryDescriptor
  | RecordDescriptor;

export abstract class AbstractDictionary<
  Descriptor extends AbstractDictionaryDescriptor
> extends AbstractType<Descriptor> {
  abstract readonly base: Type<Descriptor>;

  protected get types(): Dict<Type> {
    return this.descriptor.args;
  }

  private get defaultTypes(): Dict<Type> {
    let obj = dict<Type>();

    for (let [key, value] of entries(this.types)) {
      if (isRequired(value!.descriptor) === null) {
        value = value!.required(false);
      }

      obj[key] = value!;
    }

    return obj;
  }

  serialize(js: Dict): Option<Dict> {
    if (js === null) {
      return null;
    }

    let out: Dict = {};

    for (let [key, value] of entries(this.defaultTypes)) {
      assert(
        key in js,
        `Serialization error: missing field \`${key}\` (must validate before serializing)`
      );

      let result = value!.serialize(js[key]);

      if (result !== null) {
        out[key] = result;
      }
    }

    return out;
  }

  parse(wire: Dict): Option<Dict> {
    let out: Dict = {};

    for (let [key, value] of entries(this.defaultTypes)) {
      let raw = wire[key];

      if (raw === undefined) {
        raw = null;
      }

      out[key] = value!.parse(raw);
    }

    return out;
  }

  validation(): ValidationBuilder<unknown> {
    let obj = dict<ValidationBuilder<unknown>>();

    for (let [key, value] of entries(this.defaultTypes)) {
      if (isRequired(value!.descriptor) === null) {
        value = value!.required(false);
      }

      obj[key] = value!.validation();
    }

    return validators.strictObject(obj);
  }
}

export class DictionaryImpl extends AbstractDictionary<DictionaryDescriptor> {
  get base(): DictionaryImpl {
    let draftDict = dict<Type>();

    for (let [key, value] of entries(this.types)) {
      draftDict[key] = value!.base.required(false);
    }

    return new DictionaryImpl({
      ...this.descriptor,
      args: draftDict
    });
  }
}

export function Dictionary(dictionary: Dict<Type>): Type {
  return new DictionaryImpl({
    type: "Dictionary",
    description: "Dictionary",
    args: dictionary,
    metadata: null,
    name: null,
    features: []
  });
}

export type ConstructDictionary = (d: Dict<Type>) => DictionaryImpl;
