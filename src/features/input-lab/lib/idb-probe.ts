// IndexedDB に書いて読むだけの最小ヘルパー。再起動後も値が残るかを確かめるために使う。

const DB_NAME = "input-lab";
const STORE = "kv";
const KEY = "stamp";

function request<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function openDb(): Promise<IDBDatabase> {
  const req = indexedDB.open(DB_NAME, 1);
  req.onupgradeneeded = () => req.result.createObjectStore(STORE);
  return request(req);
}

export async function readStamp(): Promise<string | null> {
  const db = await openDb();
  try {
    const value = await request(
      db.transaction(STORE, "readonly").objectStore(STORE).get(KEY),
    );
    return typeof value === "string" ? value : null;
  } finally {
    db.close();
  }
}

export async function writeStamp(value: string): Promise<void> {
  const db = await openDb();
  try {
    await request(
      db.transaction(STORE, "readwrite").objectStore(STORE).put(value, KEY),
    );
  } finally {
    db.close();
  }
}
