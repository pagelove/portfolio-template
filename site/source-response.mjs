// Selector ranges exclude platform presentation markup; schema validation remains strict.
export async function sourceText(response){const text=await response.text();return response.status===206?'<!doctype html><html><head><meta charset="utf-8"></head><body>'+text+'</body></html>':text;}
