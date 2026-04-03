import requests

models = [
    "HuggingFaceH4/zephyr-7b-beta",
    "meta-llama/Meta-Llama-3-8B-Instruct",
    "google/gemma-7b-it",
    "microsoft/Phi-3-mini-4k-instruct",
    "Qwen/Qwen2.5-Coder-32B-Instruct",
    "mistralai/Mistral-Nemo-Instruct-2407",
    "NousResearch/Hermes-3-Llama-3.1-8B"
]

for model in models:
    url = f"https://api-inference.huggingface.co/models/{model}"
    try:
        resp = requests.post(url, json={"inputs": "hi"}, headers={"Content-Type": "application/json"})
        print(f"{model}: {resp.status_code}")
    except Exception as e:
        print(f"{model}: Error {e}")
