import os
import json
import logging
import subprocess
import time
import shutil

FUZZER_DIR = os.path.abspath(os.path.dirname(__file__))
CORPUS_DIR = os.path.join(FUZZER_DIR, "corpus")
FUZZ_BIN = os.path.join(FUZZER_DIR, "fuzz_api-fuzz.zip")
CORPUS_SEED_DIR = os.path.join(FUZZER_DIR, "corpus_seeds")
FUZZ_TIME_MINUTES = 1  

go_bin = shutil.which("go")
if go_bin:
  go_dir = os.path.dirname(go_bin)
  os.environ["PATH"] = go_dir + os.pathsep + os.environ.get("PATH", "")
else:
  logging.warning("Could not find 'go' binary in PATH. Please ensure Go is installed and available.")

def compile_fuzzer():
  logging.info("Compiling fuzzer...")
  subprocess.run(["go-fuzz-build"], check=True)
  
def corpus_setup():
  logging.info("Preparing corpus...")
  if os.path.exists(CORPUS_DIR):
      shutil.rmtree(CORPUS_DIR)
  os.makedirs(CORPUS_DIR)
  # Copy initial corpus files
  for file in os.listdir(CORPUS_SEED_DIR):
      shutil.copy(os.path.join(CORPUS_SEED_DIR, file), CORPUS_DIR)
          
def corpus_cleanup():
  logging.info("Cleaning up corpus...")
  if os.path.exists(CORPUS_DIR):
      shutil.rmtree(CORPUS_DIR)
  
def run_fuzzer():
  logging.info("Running fuzzer...")
  start_time = time.time()
  process = subprocess.Popen(["go-fuzz", FUZZ_BIN])
  try:
      while True:
          if process.poll() is not None:
              break  # Process finished
          elapsed = (time.time() - start_time) / 60  # minutes
          if elapsed >= FUZZ_TIME_MINUTES:
              logging.info("Fuzz time reached, terminating process...")
              process.terminate()
              process.wait()
              break
          time.sleep(1)
  except Exception as e:
      process.terminate()
      process.wait()
      raise
    
    
if __name__ == "__main__":
  logging.basicConfig(level=logging.INFO)
  if not os.path.exists(CORPUS_DIR):
      os.makedirs(CORPUS_DIR)
  compile_fuzzer()
  corpus_setup()
  run_fuzzer()
  corpus_cleanup()
  
  logging.info("Fuzzing completed.")
  
    
