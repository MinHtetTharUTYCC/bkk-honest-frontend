"use client";

import { useState } from "react";
import {
  useSpots,
  useCategories,
  useCreatePriceReport,
  useCreateScamAlert,
  useCreateSpot,
  useCities,
} from "@/hooks/use-api";
import SearchableSpotSelect from "@/components/spots/searchable-spot-select";
import CreateVibeForm from "@/components/vibes/create-vibe-form";
import SpotForm, { SpotFormData } from "@/components/spots/spot-form";
import { Dropdown } from "@/components/ui/dropdown";
import {
  Upload,
  X,
  Zap,
  AlertCircle,
  DollarSign,
  Send,
  CheckCircle2,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useCity } from "@/components/providers/city-provider";
import { useAuth } from "@/components/providers/auth-provider";
import LoginRequired from "@/components/auth/login-required";
import { Textarea } from "@/components/ui/textarea";

export default function ReportPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { selectedCityId, selectedCity } = useCity();
  const [activeTab, setActiveTab] = useState<
    "price" | "scam" | "vibe" | "spot"
  >("spot");
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isClient, setIsClient] = useState(true); // Initialize as true for client-side rendering

  const [submitted, setSubmitted] = useState(false);

  // Price State
  const [priceSpotId, setPriceSpotId] = useState("");
  const [itemName, setItemName] = useState("");

  // Scam State
  const [scamName, setScamName] = useState("");
  const [scamDescription, setScamDescription] = useState("");
  const [scamPreventionTip, setScamPreventionTip] = useState("");
  const [scamCategory, setScamCategory] = useState("");
  const [scamCity, setScamCity] = useState(selectedCityId || ""); // Initialize with selectedCityId
  const [scamImageFile, setScamImageFile] = useState<File | null>(null);
  const [scamImagePreview, setScamImagePreview] = useState("");

  // Data for Selects
  const { data: spotsResponse } = useSpots({ cityId: selectedCityId });
  const { data: categoriesResponse } = useCategories();
  const { data: citiesResponse } = useCities();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const spots = spotsResponse || [];
  const categories = categoriesResponse || [];
  const cities = citiesResponse || [];

  // Mutations
  const createPrice = useCreatePriceReport();
  const createScam = useCreateScamAlert();
  const createSpot = useCreateSpot();

  const handleSpotSubmit = async (formData: SpotFormData) => {
    setError(null);
    try {
      await createSpot.mutateAsync({
        name: formData.name,
        address: formData.address,
        categoryId: formData.categoryId,
        cityId: formData.cityId,
        latitude: formData.latitude,
        longitude: formData.longitude,
      });
      setSubmitted(true);
    } catch (err: unknown) {
      console.error("Failed to create spot:", err);
      const message =
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response &&
        err.response.data &&
        typeof err.response.data === "object" &&
        "message" in err.response.data
          ? err.response.data.message
          : "Failed to create spot";
      setError(
        Array.isArray(message)
          ? message[0]
          : typeof message === "string"
            ? message
            : "Failed to create spot",
      );
    }
  };

  const handlePriceSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!priceSpotId) return setError("Please select a spot");

    if (itemName.length > 100) {
      setError("Item name cannot exceed 100 characters");
      return;
    }

    try {
      const formData = new FormData(e.currentTarget);
      await createPrice.mutateAsync({
        spotId: priceSpotId,
        itemName: itemName,
        priceThb: Number(formData.get("priceThb")),
      });
      setSubmitted(true);
    } catch (err: unknown) {
      const message =
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response &&
        err.response.data &&
        typeof err.response.data === "object" &&
        "message" in err.response.data
          ? err.response.data.message
          : "Failed to publish price report";
      setError(
        Array.isArray(message)
          ? message[0]
          : typeof message === "string"
            ? message
            : "Failed to publish price report",
      );
    }
  };

  const handleScamSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!scamCity) return setError("Please select a city");

    if (scamName.length > 100) {
      setError("Scam name cannot exceed 100 characters");
      return;
    }

    if (scamDescription.length > 500) {
      setError("Description cannot exceed 500 characters");
      return;
    }

    if (scamPreventionTip.length > 300) {
      setError("Prevention tip cannot exceed 300 characters");
      return;
    }

    try {
      await createScam.mutateAsync({
        scamName,
        description: scamDescription,
        preventionTip: scamPreventionTip,
        cityId: scamCity,
        categoryId: scamCategory,
        image: scamImageFile || undefined,
      });
      setSubmitted(true);
    } catch (err: unknown) {
      const message =
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response &&
        err.response.data &&
        typeof err.response.data === "object" &&
        "message" in err.response.data
          ? err.response.data.message
          : "Failed to publish scam alert";
      setError(
        Array.isArray(message)
          ? message[0]
          : typeof message === "string"
            ? message
            : "Failed to publish scam alert",
      );
    }
  };

  const handleScamImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("Image size must be less than 10MB");
        return;
      }
      setScamImageFile(file);
      const preview = URL.createObjectURL(file);
      setScamImagePreview(preview);
    }
  };

  const handleRemoveScamImage = () => {
    setScamImageFile(null);
    if (scamImagePreview && scamImagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(scamImagePreview);
    }
    setScamImagePreview("");
  };

  if (!isClient || authLoading) {
    return (
      <div className="space-y-12 animate-pulse">
        <div className="h-12 w-48 bg-white/5 rounded-xl" />
        <div className="h-16 bg-white/5 rounded-3xl" />
        <div className="h-96 bg-white/5 rounded-2xl" />
      </div>
    );
  }

  if (!user) {
    return <LoginRequired />;
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-400/10 text-emerald-400 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-400/20 animate-bounce">
          <CheckCircle2 size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="font-display text-2xl font-bold text-foreground tracking-tight">
            Published!
          </h2>
          <p className="text-white/40 font-medium uppercase tracking-widest text-[10px]">
            Your contribution has been added to the pulse.
          </p>
        </div>
        <button
          onClick={() => router.push("/")}
          className="bg-amber-400 text-black px-8 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-amber-300 transition-colors"
        >
          Back to Pulse
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-12 pb-24">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-4xl font-bold text-foreground tracking-tight">
          Contribute
        </h1>
        <p className="text-white/40 font-medium uppercase tracking-widest text-[10px]">
          Keep {selectedCity?.name || "the city"} honest by sharing live reports
        </p>
      </header>

      {/* Tabs */}
      <div className="bg-white/8 p-1.5 rounded-3xl flex flex-wrap md:flex-nowrap gap-1">
        {(["price", "scam", "vibe", "spot"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setError(null);
            }}
            className={cn(
              "flex-1 min-w-25 py-3.5 rounded-2xl text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all",
              activeTab === tab
                ? "bg-amber-400 text-black shadow-sm"
                : "text-white/40 hover:text-white/70",
            )}
          >
            {tab === "price" && (
              <div className="flex items-center justify-center gap-2">
                <DollarSign size={14} /> Price
              </div>
            )}
            {tab === "scam" && (
              <div className="flex items-center justify-center gap-2">
                <AlertCircle size={14} /> Scam
              </div>
            )}
            {tab === "vibe" && (
              <div className="flex items-center justify-center gap-2">
                <Zap size={14} /> Vibe
              </div>
            )}
            {tab === "spot" && (
              <div className="flex items-center justify-center gap-2">
                <MapPin size={14} /> Spot
              </div>
            )}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="bg-card rounded-2xl p-8 md:p-10 border border-white/8 shadow-2xl shadow-black/30">
        {activeTab === "price" && (
          <form onSubmit={handlePriceSubmit} className="space-y-8">
            <SearchableSpotSelect
              name="spotId"
              required
              placeholder="Search spots..."
              cityId={selectedCityId}
              onSelect={(id) => setPriceSpotId(id)}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="block text-[10px] font-medium uppercase tracking-widest text-white/40 ml-1">
                  Item Name
                </label>
                <input
                  name="itemName"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Pad Thai"
                  className={cn(
                    "w-full bg-white/5 border border-white/10 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all rounded-2xl px-5 py-4 text-sm font-medium text-foreground placeholder:text-white/20 outline-none",
                    (itemName?.length || 0) > 100 &&
                      "border-red-500/50 ring-1 ring-red-500/20",
                  )}
                />
                <div className="flex justify-end">
                  <span
                    className={cn(
                      "text-[9px] font-bold tracking-normal transition-colors",
                      (itemName?.length || 0) > 100
                        ? "text-red-400"
                        : "text-white/30",
                    )}
                  >
                    {itemName?.length || 0}/100
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <label className="block text-[10px] font-medium uppercase tracking-widest text-white/40 ml-1">
                  Price (THB)
                </label>
                <input
                  name="priceThb"
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  className="w-full bg-white/5 border border-white/10 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all rounded-2xl px-5 py-4 text-sm font-medium text-foreground placeholder:text-white/20 outline-none"
                />
              </div>
            </div>

            <button
              disabled={
                createPrice.isPending || !priceSpotId || itemName.length > 100
              }
              className="w-full bg-amber-400 text-black py-5 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-amber-300 transition-all flex items-center justify-center gap-3 shadow-xl shadow-amber-400/20 active:scale-[0.98] disabled:opacity-50"
            >
              <Send size={16} />
              {createPrice.isPending ? "Publishing..." : "Publish Price Report"}
            </button>
          </form>
        )}

        {activeTab === "scam" && (
          <form onSubmit={handleScamSubmit} className="space-y-8">
            <div className="space-y-4">
              <label className="block text-[10px] font-medium uppercase tracking-widest text-white/40 ml-1">
                Scam Name
              </label>
              <input
                value={scamName}
                onChange={(e) => setScamName(e.target.value)}
                required
                placeholder="e.g. Broken Meter Taxi"
                className={cn(
                  "w-full bg-white/5 border border-white/10 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all rounded-2xl px-5 py-4 text-sm font-medium text-foreground placeholder:text-white/20 outline-none",
                  scamName.length > 100 &&
                    "border-red-500/50 ring-1 ring-red-500/20",
                )}
              />
              <div className="flex justify-end">
                <span
                  className={cn(
                    "text-[9px] font-bold tracking-normal transition-colors",
                    scamName.length > 100 ? "text-red-400" : "text-white/30",
                  )}
                >
                  {scamName.length}/100
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Dropdown
                label="City"
                options={cities || []}
                value={scamCity}
                onChange={setScamCity}
                placeholder="Select city..."
              />
              <Dropdown
                label="Category"
                options={categories || []}
                value={scamCategory}
                onChange={setScamCategory}
                placeholder="Select category..."
              />
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-medium uppercase tracking-widest text-white/40 ml-1">
                Description
              </label>
              <Textarea
                value={scamDescription}
                onChange={(e) => setScamDescription(e.target.value)}
                required
                rows={4}
                placeholder="What happened? Be specific."
                className={cn(
                  "w-full bg-white/5 border border-white/10 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all rounded-2xl px-5 py-4 text-sm font-medium text-foreground placeholder:text-white/20 outline-none resize-none",
                  scamDescription.length > 500 &&
                    "border-red-500/50 ring-1 ring-red-500/20",
                )}
              />
              <div className="flex justify-end">
                <span
                  className={cn(
                    "text-[9px] font-bold tracking-normal transition-colors",
                    scamDescription.length > 500
                      ? "text-red-400"
                      : "text-white/30",
                  )}
                >
                  {scamDescription.length}/500
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-medium uppercase tracking-widest text-white/40 ml-1">
                Prevention Tip
              </label>
              <Textarea
                value={scamPreventionTip}
                onChange={(e) => setScamPreventionTip(e.target.value)}
                required
                rows={3}
                placeholder="How can others avoid this?"
                className={cn(
                  "w-full bg-white/5 border border-white/10 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all rounded-2xl px-5 py-4 text-sm font-medium text-foreground placeholder:text-white/20 outline-none resize-none",
                  scamPreventionTip.length > 300 &&
                    "border-red-500/50 ring-1 ring-red-500/20",
                )}
              />
              <div className="flex justify-end">
                <span
                  className={cn(
                    "text-[9px] font-bold tracking-normal transition-colors",
                    scamPreventionTip.length > 300
                      ? "text-red-400"
                      : "text-white/30",
                  )}
                >
                  {scamPreventionTip.length}/300
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-medium uppercase tracking-widest text-white/40 ml-1">
                Image <span className="text-white/50">(Optional)</span>
              </label>

              {scamImagePreview ? (
                <div className="relative rounded-xl overflow-hidden border border-white/10 bg-white/5">
                  <img
                    src={scamImagePreview}
                    alt="Scam preview"
                    className="w-full h-64 object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveScamImage}
                    disabled={createScam.isPending}
                    className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 text-white p-2 rounded-lg transition-colors disabled:opacity-50"
                    aria-label="Remove image"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="block cursor-pointer group">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleScamImageChange}
                    disabled={createScam.isPending}
                    className="hidden"
                    aria-label="Upload scam image"
                  />
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-xl p-8 text-center transition-all",
                      "hover:bg-white/5 hover:border-red-400/50",
                      createScam.isPending
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer",
                    )}
                  >
                    <Upload
                      size={24}
                      className="text-white/50 group-hover:text-red-400 mx-auto mb-2 transition-colors"
                    />
                    <p className="text-sm text-white/70">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-white/50 mt-1">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                </label>
              )}
            </div>

            <button
              disabled={
                createScam.isPending ||
                !scamName ||
                !scamDescription ||
                !scamCategory ||
                !scamCity ||
                scamName.length > 100 ||
                scamDescription.length > 500 ||
                scamPreventionTip.length > 300
              }
              className="w-full bg-red-500 text-white py-5 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-red-600 transition-all flex items-center justify-center gap-3 shadow-xl shadow-red-400/20 active:scale-[0.98] disabled:opacity-50"
            >
              <AlertCircle size={16} />
              {createScam.isPending ? "Publishing..." : "Publish Scam Alert"}
            </button>
          </form>
        )}

        {activeTab === "vibe" && (
          <CreateVibeForm
            showSpotSelect
            cityId={selectedCityId}
            onSuccess={() => setSubmitted(true)}
          />
        )}

        {activeTab === "spot" && (
          <SpotForm
            mode="create"
            onSubmit={handleSpotSubmit}
            isLoading={createSpot.isPending}
            categories={categories}
            cities={cities}
            initialData={{
              cityId: selectedCityId || "",
            }}
          />
        )}
      </div>
    </div>
  );
}
