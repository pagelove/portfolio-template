// Recovery contains serialized HTML snapshots only; the working DOM remains authoritative.
export function createRecovery(storage,key){
 return {read(){try{return{ok:true,value:storage().getItem(key)};}catch{return{ok:false,value:null};}},write(value){try{storage().setItem(key,value);return true;}catch{return false;}},remove(){try{storage().removeItem(key);return true;}catch{return false;}}};
}
