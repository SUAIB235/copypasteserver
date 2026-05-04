import { useEffect, useState } from "react";
import { db } from "./firebase";

import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  doc,
  deleteDoc,
  updateDoc,
  increment,
  getDoc,
  setDoc,
} from "firebase/firestore";

import toast, { Toaster } from "react-hot-toast";

import { FaRocket, FaCopy } from "react-icons/fa";
import {
  BsActivity,
  BsDownload,
  BsGrid,
  BsX,
  BsTrash,
  BsPencil,
} from "react-icons/bs";
import { MdReport } from "react-icons/md";

export default function App() {
  const [accessKey, setAccessKey] = useState("");
  const [showKeySetup, setShowKeySetup] = useState(true);

  const [number, setNumber] = useState("");
  const [data, setData] = useState([]);
  const [services, setServices] = useState([]);

  const [totalViews, setTotalViews] = useState(0);
  const [showViews, setShowViews] = useState(false);
  const [showServices, setShowServices] = useState(false);

  // 🔑 LOAD KEY FROM LOCAL STORAGE
  useEffect(() => {
    const savedKey = localStorage.getItem("accessKey");
    if (savedKey) {
      setAccessKey(savedKey);
      setShowKeySetup(false);
    }
  }, []);

  // 📊 LOAD RECORDS
  useEffect(() => {
    if (!accessKey) return;

    const q = query(
      collection(db, "keys", accessKey, "records"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setData(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsub();
  }, [accessKey]);

  // 📦 LOAD SERVICES
  useEffect(() => {
    if (!accessKey) return;

    const q = query(
      collection(db, "keys", accessKey, "services"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setServices(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsub();
  }, [accessKey]);

  // 👁 VIEW COUNTER
  useEffect(() => {
    const run = async () => {
      const ref = doc(db, "analytics", "global");

      try {
        await updateDoc(ref, { views: increment(1) });
        const snap = await getDoc(ref);
        setTotalViews(snap.data().views);
      } catch {
        await setDoc(ref, { views: 1 });
        setTotalViews(1);
      }
    };

    run();
  }, []);

  // 🔑 SAVE KEY
  const saveKey = async () => {
    if (!accessKey.trim()) {
      return toast.error("Enter valid key");
    }

    localStorage.setItem("accessKey", accessKey);
    setShowKeySetup(false);

    toast.success("Key saved");
  };

  // ➕ ADD RECORD
  const handleSubmit = async () => {
    if (!number.trim()) return toast.error("Enter number");

    await setDoc(
      doc(db, "keys", accessKey),
      { createdAt: serverTimestamp() },
      { merge: true }
    );

    await addDoc(collection(db, "keys", accessKey, "records"), {
      number,
      createdAt: serverTimestamp(),
    });

    setNumber("");
    toast.success("Added");
  };

  // ❌ DELETE
  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "keys", accessKey, "records", id));
    toast.success("Deleted");
  };

  const handleViewClick = () => {
    setShowViews(true);
    setTimeout(() => setShowViews(false), 3000);
  };

  // 🔑 KEY SETUP UI
  if (showKeySetup) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#eef6f1]">
        <div className="bg-white p-6 rounded-2xl shadow w-[90%] max-w-sm">
          {/* 🔐 ICON */}
          <div className="flex justify-center mb-3">
            <div className="bg-green-100 p-3 rounded-full">
              <FaKey className="text-green-600 text-xl" />
            </div>
          </div>

          {/* 🧠 UPDATED TITLE */}
          <h2 className="mb-2 font-semibold text-center text-lg text-gray-800">
            Secure Access Key
          </h2>

          {/* 📝 INSTRUCTION */}
          <p className="text-sm text-gray-500 text-center mb-4 leading-relaxed">
            Enter your unique key to access your private data space. Same key =
            same data.
          </p>

          <input
            value={accessKey}
            onChange={(e) => setAccessKey(e.target.value)}
            placeholder="e.g. my-secret-key"
            className="border px-3 py-3 rounded-lg w-full mb-4 focus:ring-2 focus:ring-green-500 outline-none"
          />

          <button
            onClick={saveKey}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition active:scale-95"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // 🧩 MAIN UI
  return (
    <div className="min-h-screen bg-[#eef6f1] flex items-center justify-center p-4">
      <Toaster />

      {/* TOP RIGHT */}
      <div className="absolute top-3 right-4 flex gap-3">
        <button
          onClick={handleViewClick}
          className="bg-white p-2 rounded-full shadow"
        >
          {showViews ? totalViews : <BsActivity />}
        </button>

        <button
          onClick={() =>
            window.open(
              "https://drive.google.com/file/d/11XHSxMIoTjIL0H7Yw23E4JumW50MECss/view?usp=drivesdk",
              "_blank"
            )
          }
          className="bg-white p-2 rounded-full shadow"
        >
          <BsDownload />
        </button>

        <button
          onClick={() => setShowServices(true)}
          className="bg-white p-2 rounded-full shadow"
        >
          <BsGrid />
        </button>
      </div>

      {/* SERVICES MODAL */}
      {showServices && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-5 w-[90%] max-w-sm relative">
            <button
              onClick={() => setShowServices(false)}
              className="absolute top-3 right-3"
            >
              <BsX />
            </button>

            <h2 className="mb-4 font-semibold">More Services</h2>

            <button
              onClick={() =>
                window.open("https://drive.google.com/file/d/1tT9eLOoWFW9UemD65WAgtCKaBddbH742/view?usp=drivesdk" , "_blank")
              }
              className="bg-gray-100 px-4 py-3 rounded-lg w-full text-left"
            >
              <MdReport className="inline mr-2 text-green-600" />
              Scammer Data
            </button>
          </div>
        </div>
      )}

      {/* MAIN CARD */}
      <div className="w-full max-w-2xl bg-white rounded-3xl p-4 sm:p-6 shadow-lg">
        <h1 className="text-center text-xl font-bold mb-3">
          <FaRocket className="inline text-green-600" /> Quick Data Manager
        </h1>

        {/* KEY DISPLAY */}
        <div className="flex justify-center items-center gap-2 mb-4">
          <p className="text-sm text-gray-500">Key: {accessKey}</p>

          <button
            onClick={() => setShowKeySetup(true)}
            className="text-green-600"
          >
            <BsPencil />
          </button>
        </div>

        {/* INPUT + BUTTON (MOBILE FRIENDLY) */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className="flex-1 border px-4 py-3 rounded-xl text-base focus:ring-2 focus:ring-green-500"
            placeholder="Enter Number"
          />

          <button
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium active:scale-95"
          >
            Add
          </button>
        </div>

        {/* DATA LIST */}
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {data.map((item, i) => (
            <div
              key={item.id}
              className="bg-gray-50 p-4 rounded-xl flex justify-between items-center shadow-sm"
            >
              <div>
                <p className="text-xs text-gray-400">#{i + 1}</p>
                <p>{item.number}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(item.number);
                    toast.success("Copied!");
                  }}
                  className="bg-green-500 text-white px-3 py-2 rounded-lg active:scale-95"
                >
                  <FaCopy />
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="bg-red-500 text-white px-3 py-2 rounded-lg active:scale-95"
                >
                  <BsTrash />
                </button>
              </div>
            </div>
          ))}
        </div>

        {data.length === 0 && (
          <p className="text-center text-gray-400 mt-4">
            No records yet
          </p>
        )}
      </div>
    </div>
  );
}
