import { useEffect, useState } from "react";
import { db, auth, provider } from "./firebase";

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
  getDocs, // ✅ ADD THIS
} from "firebase/firestore";

import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";

import toast, { Toaster } from "react-hot-toast";

import { FaRocket, FaGoogle, FaCopy } from "react-icons/fa";
import {
  BsActivity,
  BsDownload,
  BsGrid,
  BsX,
  BsBoxArrowRight,
  BsTrash,
  BsPencil,
} from "react-icons/bs";
import { MdReport } from "react-icons/md";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [accessKey, setAccessKey] = useState("");
  const [showKeySetup, setShowKeySetup] = useState(true);

  const [number, setNumber] = useState("");
  const [data, setData] = useState([]);
  const [services, setServices] = useState([]);

  const [totalViews, setTotalViews] = useState(0);
  const [showViews, setShowViews] = useState(false);
  const [showServices, setShowServices] = useState(false);

  // 🔐 AUTH
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // 🔑 LOAD KEY FROM FIREBASE
  useEffect(() => {
    if (!user) return;

    const loadKey = async () => {
      const ref = doc(db, "users", user.uid, "config", "main");
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const savedKey = snap.data().accessKey;
        if (savedKey) {
          setAccessKey(savedKey);
          setShowKeySetup(false);
        }
      }
    };

    loadKey();
  }, [user]);

  // 📊 LOAD RECORDS
  useEffect(() => {
    if (!accessKey) return;

    const q = query(
      collection(db, "keys", accessKey, "records"),
      orderBy("createdAt", "desc"),
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
      orderBy("createdAt", "desc"),
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

  // 🔐 LOGIN
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      toast.success("Logged in");
    } catch {
      toast.error("Login failed");
    }
  };

  // 🔓 LOGOUT
  const handleLogout = async () => {
    await signOut(auth);
    setAccessKey("");
    setShowKeySetup(true);
    toast.success("Logged out");
  };

  const saveKey = async () => {
    if (!accessKey.trim()) {
      return toast.error("Enter valid key");
    }

    const q = query(
      collection(db, "keys", accessKey, "records"),
      orderBy("createdAt", "desc"),
    );

    const snap = await getDocs(q);

    // Optional: allow new keys
    await setDoc(doc(db, "users", user.uid, "config", "main"), {
      accessKey: accessKey,
    });

    await setDoc(doc(db, "users", user.uid, "config", "main"), {
      accessKey: accessKey,
    });

    setShowKeySetup(false);
    toast.success("Key saved");
  };

  const handleSubmit = async () => {
    if (!number.trim()) return toast.error("Enter number");

    // 🔹 Ensure key document exists
    await setDoc(
      doc(db, "keys", accessKey),
      { createdAt: serverTimestamp() },
      { merge: true },
    );

    // 🔹 Add record
    await addDoc(collection(db, "keys", accessKey, "records"), {
      number,
      createdAt: serverTimestamp(),
    });

    setNumber("");
    toast.success("Added");
  };

  // ❌ DELETE NUMBER
  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "keys", accessKey, "records", id));
    toast.success("Deleted");
  };

  const handleViewClick = () => {
    setShowViews(true);
    setTimeout(() => setShowViews(false), 3000);
  };

  // ⏳ LOADING
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // 🔐 LOGIN UI
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#eef6f1]">
        <button
          onClick={handleLogin}
          className="flex items-center gap-3 bg-white px-6 py-3 rounded-xl shadow hover:bg-green-50"
        >
          <FaGoogle className="text-red-500" />
          Sign in with Google
        </button>
      </div>
    );
  }

  // 🔑 KEY SETUP
  if (showKeySetup) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#eef6f1]">
        <div className="bg-white p-6 rounded-2xl shadow w-[90%] max-w-sm">
          <h2 className="mb-4 font-semibold text-center">Enter Access Key</h2>

          <input
            value={accessKey}
            onChange={(e) => setAccessKey(e.target.value)}
            className="border px-3 py-2 rounded-lg w-full mb-4"
          />

          <button
            onClick={saveKey}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
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
          className="bg-white p-2 rounded-full shadow hover:bg-green-50"
        >
          {showViews ? totalViews : <BsActivity />}
        </button>

        <button
          onClick={() => window.open("https://drive.google.com/file/d/174yAsyTZWD-6cdUycCsPGtWpvGcSLnEQ/view?usp=drive_link")}
          className="bg-white p-2 rounded-full shadow hover:bg-green-50"
        >
          <BsDownload />
        </button>

        <button
          onClick={() => setShowServices(true)}
          className="bg-white p-2 rounded-full shadow hover:bg-green-50"
        >
          <BsGrid />
        </button>

        <button
          onClick={handleLogout}
          className="bg-white p-2 rounded-full shadow hover:bg-green-50"
        >
          <BsBoxArrowRight className="text-red-500" />
        </button>
      </div>

      {showServices && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-sm p-5 relative animate-fadeIn">
            {/* CLOSE BUTTON */}
            <button
              onClick={() => setShowServices(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-red-500"
            >
              <BsX className="text-2xl" />
            </button>

            {/* TITLE */}
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              More Services
            </h2>

            {/* LINKS */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.open("https://scammers-data.vercel.app/", "_blank")}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-left w-full"
              >
                <MdReport className="text-[#00bc7d]" />
                <span>Scammer Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CARD */}
      <div className="w-full max-w-2xl bg-white rounded-3xl p-6 shadow-lg">
        <h1 className="text-center text-xl font-bold mb-3">
          <FaRocket className="inline text-green-600" /> Quick Data Manager
        </h1>

        {/* KEY + EDIT */}
        <div className="flex justify-center items-center gap-2 mb-4">
          <p className="text-sm text-gray-500">Key: {accessKey}</p>

          <button
            onClick={() => setShowKeySetup(true)}
            className="text-green-600"
          >
            <BsPencil />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-3 mb-6">
          <input
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className="border px-4 py-2 rounded-xl"
            placeholder="Enter Number"
          />

          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white rounded-xl"
          >
            Add Record
          </button>
        </div>

        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {data.map((item, i) => (
            <div
              key={item.id}
              className="bg-gray-50 p-3 rounded-xl flex justify-between items-center"
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
                  className="bg-green-500 text-white px-2 py-1 rounded"
                >
                  <FaCopy />
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  <BsTrash />
                </button>
              </div>
            </div>
          ))}
        </div>

        {data.length === 0 && (
          <p className="text-center text-gray-400 mt-4">No records yet</p>
        )}
      </div>
    </div>
  );
}
