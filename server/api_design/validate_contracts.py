import os
import json
import sys
from jsonschema import validate, ValidationError

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CONTRACTS_DIR = os.path.join(BASE_DIR, "contracts")
EXAMPLES_DIR = os.path.join(BASE_DIR, "examples")
SCHEMA_FILE = os.path.join(BASE_DIR, "schema.json")


def load_json(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)


def resolve_ref(ref):
    """
    Resolve a $ref string:
    - Direct example file: "blogs/list.200.json"
    - Catalog reference: "errors.json#/404"
    """
    if "#/" in ref:
        file_name, fragment = ref.split("#/")
        file_path = os.path.join(EXAMPLES_DIR, file_name)
        catalog = load_json(file_path)

        if fragment not in catalog:
            raise ValueError(f"Missing fragment '{fragment}' in {file_path}")

        node = catalog[fragment]
        if "example" not in node or "$ref" not in node["example"]:
            raise ValueError(f"Fragment {fragment} missing example.$ref in {file_path}")
        return resolve_ref(node["example"]["$ref"])
    else:
        full_path = os.path.join(EXAMPLES_DIR, ref)
        if not os.path.exists(full_path):
            raise FileNotFoundError(f"Missing example file: {full_path}")
        return load_json(full_path)


def validate_contract(contract_file, schema):
    print(f"Validating {contract_file}...")
    contracts = load_json(contract_file)

    for endpoint in contracts:
        method = endpoint.get("method")
        path = endpoint.get("endpoint")
        responses = endpoint.get("responses", {})

        for status_code, spec in responses.items():
            try:
                if "$ref" in spec:
                    example = resolve_ref(spec["$ref"])
                elif "example" in spec:
                    example = spec["example"]
                else:
                    model = endpoint.get("model")
                    verb = method.lower() if method else "get"
                    example_path = (
                        os.path.join(EXAMPLES_DIR, model, f"{verb}.{status_code}.json")
                        if model
                        else None
                    )
                    if not example_path or not os.path.exists(example_path):
                        print(
                            f"  ⚠️ No example or $ref for {method} {path} "
                            f"[{status_code}]"
                        )
                        continue
                    example = load_json(example_path)

                # ✅ Validate example against schema
                validate(instance=example, schema=schema)
                print(f"  ✅ {method} {path} [{status_code}]")
            except ValidationError as e:
                print(
                    f"  ❌ {method} {path} [{status_code}] "
                    f"schema validation failed -> {e.message}"
                )
            except Exception as e:
                print(
                    f"  ❌ {method} {path} [{status_code}] "
                    f"resolution/validation failed -> {e}"
                )

    print(f"Done with {contract_file}\n")


def main():
    schema = load_json(SCHEMA_FILE)
    success = True

    for file_name in os.listdir(CONTRACTS_DIR):
        if not file_name.endswith(".json") or file_name == "errors.json":
            continue
        file_path = os.path.join(CONTRACTS_DIR, file_name)
        try:
            validate_contract(file_path, schema)
        except Exception as e:
            success = False
            print(f"❌ Failed {file_name}: {e}")

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
