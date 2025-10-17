import pandas as pd
import sys, json
from indic_transliteration import sanscript
from indic_transliteration.sanscript import transliterate

file_path = sys.argv[1]
sheet_name = sys.argv[2]
selected_columns = json.loads(sys.argv[3])
output_file = sys.argv[4] 

df = pd.read_excel(file_path, sheet_name=sheet_name)

def nepali_to_roman(text):
    try:
        return transliterate(str(text), sanscript.DEVANAGARI, sanscript.ITRANS)
    except Exception:
        return text

romanized_df = df.copy()

for col in selected_columns:
    romanized_df[col + "_english"] = df[col].apply(nepali_to_roman)

romanized_df.to_excel(output_file, index=False)
print("Transliteration completed successfully")
