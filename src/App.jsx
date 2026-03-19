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
    if (!number) {
      toast.error("Enter number");
      return;
    }

    await addDoc(collection(db, "records"), {
      number,
    });

    setNumber("");
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

      <div className="fixed top-5 left-4 z-50">
        <a
          href="https://drive.google.com/file/d/1vFxI9iRS_pzv0JozfTZAjTyKQINTAeBX/view?usp=drive_link"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "none" }}
        >
          <button className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/20 backdrop-blur-lg border border-white/30 shadow-xl hover:scale-105 transition">
            <img
              src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png"
              alt="Drive"
              className="w-7 h-7"
            />
            <div className="text-left">
              <p className="text-xs text-gray-600">Get the app</p>
              <p className="font-semibold text-gray-800">Download APK</p>
            </div>
          </button>
        </a>
      </div>

      <div className="w-full max-w-2xl bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl p-6 border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          🚀 Quick Data Manager
        </h1>

        {/* Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          <input
            className="border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter Number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
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
              </div>

              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => copyText(item.number)}
                  className="px-3 py-1 bg-slate-200 rounded-lg hover:bg-slate-300 text-sm"
                >
                  Copy No
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
