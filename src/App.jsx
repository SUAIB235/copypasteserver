import { useEffect, useState } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import toast, { Toaster } from "react-hot-toast";

export default function App() {
  const [number, setNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [data, setData] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "records"), (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setData(list);
    });

    return () => unsub();
  }, []);

  const handleSubmit = async () => {
    if (!number || !amount) {
      toast.error("Fill all fields");
      return;
    }

    await addDoc(collection(db, "records"), {
      number,
      amount,
    });

    setNumber("");
    setAmount("");
    toast.success("Record added successfully ✅");
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "records", id));
    toast.success("Deleted successfully ❌");
  };

  const copyText = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied: " + text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
      <Toaster position="top-right" />

      <div className="w-full max-w-2xl bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl p-6 border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          🚀 Quick Data Manager
        </h1>

        {/* Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <input
            className="border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter Number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
          />

          <input
            className="border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <button
            onClick={handleSubmit}
            className="bg-indigo-600 text-white rounded-xl px-4 py-2 hover:bg-indigo-700 transition font-medium"
          >
            Add
          </button>
        </div>

        {/* Records List */}
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
          {data.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:shadow-lg transition"
            >
              <div>
                <p className="text-gray-700 text-sm">
                  <span className="font-semibold">Number:</span> {item.number}
                </p>
                <p className="text-gray-700 text-sm">
                  <span className="font-semibold">Amount:</span> {item.amount}
                </p>
              </div>

              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => copyText(item.number)}
                  className="px-3 py-1 bg-slate-200 rounded-lg hover:bg-slate-300 text-sm"
                >
                  Copy No
                </button>

                <button
                  onClick={() => copyText(item.amount)}
                  className="px-3 py-1 bg-slate-200 rounded-lg hover:bg-slate-300 text-sm"
                >
                  Copy Amt
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="px-3 py-1 bg-rose-500 text-white rounded-lg hover:bg-rose-600 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {data.length === 0 && (
          <p className="text-center text-gray-400 mt-6">No records yet</p>
        )}
      </div>
    </div>
  );
}
