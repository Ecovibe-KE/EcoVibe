import os
import json
import glob
import sys

ROOT = os.path.dirname(__file__)
CONTRACTS_DIR = os.path.join(ROOT, "contracts")
EXAMPLES_DIR = os.path.join(ROOT, "examples")


def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def resolve_ref(ref):
    """
    Resolve a $ref string:
    - Direct example file: "blogs/list.200.json"
    - Catalog reference: "errors.json#/404"
    """
    if "#/" in ref:
        file_path, fragment = ref.split("#/")
        file_path = os.path.join(EXAMPLES_DIR, file_path)
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
            raise FileNotFoundError(f"Missing file: {full_path}")
        return load_json(full_path)


def validate_contract(contract_file):
    print(f"Validating {contract_file}...")
    contracts = load_json(contract_file)

    for endpoint in contracts:
        responses = endpoint.get("responses", {})
        for status_code, spec in responses.items():
            try:
                if "$ref" in spec:
                    resolve_ref(spec["$ref"])
                elif "example" in spec:
                    json.dumps(spec["example"])
                else:
                    # Try auto-locate
                    model = endpoint.get("model")
                    verb = endpoint.get("method").lower()
                    example_path = (
                        os.path.join(
                            EXAMPLES_DIR,
                            model,
                            f"{verb}.{status_code}.json",
                        )
                        if model
                        else None
                    )
                    if not example_path or not os.path.exists(example_path):
                        print(
                            f"  ⚠️ No example or $ref for "
                            f"{endpoint['method']} {endpoint['endpoint']} "
                            f"[{status_code}]"
                        )
                        continue
                # If we reach here, the example exists and is valid
                print(
                    f"  ✅ {endpoint['method']} "
                    f"{endpoint['endpoint']} [{status_code}]"
                )
            except Exception as e:
                print(
                    f"  ❌ {endpoint['method']} "
                    f"{endpoint['endpoint']} [{status_code}] -> {e}"
                )

    print(f"Done with {contract_file}\n")


def main():
    files = glob.glob(os.path.join(CONTRACTS_DIR, "*.json"))
    for f in files:
        if os.path.basename(f) == "errors.json":
            continue
        validate_contract(f)


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"Validation failed: {e}")
        sys.exit(1)
