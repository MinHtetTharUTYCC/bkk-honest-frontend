"use client";

export default function SentryTestPage() {
  return (
    <div className="p-10 flex flex-col gap-5">
      <h1 className="text-2xl font-bold">Sentry Debug Page</h1>
      <button
        type="button"
        className="bg-red-500 text-white px-5 py-2 rounded"
        onClick={() => {
          throw new Error("Sentry Frontend Test Error");
        }}
      >
        Throw Frontend Error
      </button>
    </div>
  );
}
