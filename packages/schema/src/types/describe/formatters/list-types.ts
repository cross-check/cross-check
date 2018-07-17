import { Dict, unknown } from "ts-std";
import { Record } from "../../../record";
import {
  AliasDescriptor,
  CollectionDescriptor,
  DictionaryDescriptor,
  PrimitiveDescriptor,
  RecordDescriptor
} from "../../fundamental/descriptor";
import {
  RecursiveDelegate,
  RecursiveDelegateTypes,
  RecursiveVisitor
} from "../visitor";

export interface ListTypesTypes extends RecursiveDelegateTypes {
  primitive: Dict;
  generic: Dict;
  dictionary: Dict;
  alias: Dict;
  record: string[];
}

class ListTypes implements RecursiveDelegate<ListTypesTypes> {
  private visitor = RecursiveVisitor.build<ListTypesTypes>(this);

  alias({ name }: AliasDescriptor): Dict {
    return { [name]: true };
  }

  required(item: Dict): Dict {
    return item;
  }

  primitive({ name }: PrimitiveDescriptor): Dict {
    return { [name || "anonymous"]: true };
  }

  generic(of: Dict, descriptor: CollectionDescriptor): Dict {
    let kind = descriptor.type;
    let name = `${kind[0].toUpperCase()}${kind.slice(1)}`;
    return { ...of, [name]: true };
  }

  dictionary(descriptor: DictionaryDescriptor): Dict {
    return { ...this.dict(descriptor), Dictionary: true };
  }

  record(descriptor: RecordDescriptor): string[] {
    return Object.keys(this.dict(descriptor)).sort();
  }

  private dict(descriptor: DictionaryDescriptor | RecordDescriptor) {
    let members: Dict = {};

    this.visitor.processDictionary(descriptor, (item: Dict) => {
      members = { ...members, ...item };
    });

    return members;
  }
}

export function listTypes(record: Record): unknown {
  return new ListTypes().record(record.descriptor);
}
