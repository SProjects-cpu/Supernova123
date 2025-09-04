import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface CreateEventModalProps {
  onClose: () => void;
}

export function CreateEventModal({ onClose }: CreateEventModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "hackathon",
    startDate: "",
    endDate: "",
    location: "",
    maxParticipants: 100,
    registrationDeadline: "",
    requirements: [""],
    prizes: [{ position: "1st Place", prize: "", amount: 0 }],
    tags: [] as string[],
    eventImage: "",
    registrationFee: 0
  });
  const [tagInput, setTagInput] = useState("");
  const [selectedJudges, setSelectedJudges] = useState<Set<Id<"users">>>(new Set());
  const [showJudgeSelection, setShowJudgeSelection] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const createEvent = useMutation(api.events.create);
  const assignJudge = useMutation(api.events.assignJudgeToEvent);

  const compressImage = (file: File, maxSizeKB: number = 800): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions to keep aspect ratio
        const maxWidth = 1200;
        const maxHeight = 800;
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);

        // Start with high quality and reduce if needed
        let quality = 0.8;
        let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

        // Reduce quality until under size limit
        while (compressedDataUrl.length > maxSizeKB * 1024 * 1.37 && quality > 0.1) { // 1.37 accounts for base64 overhead
          quality -= 0.1;
          compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        resolve(compressedDataUrl);
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (limit to 5MB before compression)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image file is too large. Please select an image under 5MB.");
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select a valid image file.");
        return;
      }

      setImageFile(file);

      try {
        // Compress image to under 800KB
        const compressedImage = await compressImage(file, 800);
        setImagePreview(compressedImage);
        setFormData(prev => ({ ...prev, eventImage: compressedImage }));
        toast.success("Image uploaded and compressed successfully!");
      } catch (error) {
        console.error("Error compressing image:", error);
        toast.error("Failed to process image. Please try a different image.");
      }
    }
  };
  const availableJudges = useQuery(api.events.getAvailableJudges);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const eventId = await createEvent({
        ...formData,
        requirements: formData.requirements.filter(req => req.trim()),
        prizes: formData.prizes.filter(prize => prize.prize.trim())
      });

      // Assign selected judges to the event
      if (selectedJudges.size > 0) {
        await Promise.all(
          Array.from(selectedJudges).map(judgeId =>
            assignJudge({ eventId, judgeId })
          )
        );
      }

      toast.success(`Event created successfully! ${selectedJudges.size > 0 ? `${selectedJudges.size} judge(s) assigned.` : ''} 🌟`);
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to create event");
    }
  };

  const addRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, ""]
    }));
  };

  const updateRequirement = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.map((req, i) => i === index ? value : req)
    }));
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const addPrize = () => {
    setFormData(prev => ({
      ...prev,
      prizes: [...prev.prizes, { position: "", prize: "", amount: 0 }]
    }));
  };

  const updatePrize = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      prizes: prev.prizes.map((prize, i) => 
        i === index ? { ...prize, [field]: value } : prize
      )
    }));
  };

  const removePrize = (index: number) => {
    setFormData(prev => ({
      ...prev,
      prizes: prev.prizes.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-space-navy/90 backdrop-blur-md border border-white/10 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-3xl font-bold bg-gradient-to-r from-starlight-white to-supernova-gold bg-clip-text text-transparent">
            Create Stellar Event 🚀
          </h3>
          <button
            onClick={onClose}
            className="text-starlight-white/70 hover:text-starlight-white text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-starlight-white font-medium mb-2">Event Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-starlight-white placeholder-starlight-white/50 focus:border-supernova-gold focus:ring-1 focus:ring-supernova-gold outline-none transition-all"
                placeholder="Enter event title"
              />
            </div>
            <div>
              <label className="block text-starlight-white font-medium mb-2">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-supernova-gold rounded-full"></span>
                  Category *
                </span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-starlight-white focus:border-supernova-gold focus:ring-2 focus:ring-supernova-gold/20 outline-none transition-all duration-300 hover:border-supernova-gold/60 hover:bg-white/15 cursor-pointer backdrop-blur-md appearance-none bg-[url('data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%23F1F5F9\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3e%3c/svg%3e')] bg-[length:1.5em_1.5em] bg-[right_0.75rem_center] bg-no-repeat pr-10"
                style={{
                  backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23F1F5F9' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e\")"
                }}
              >
                <option value="hackathon">💻 Hackathon</option>
                <option value="competition">🏆 Competition</option>
                <option value="workshop">🛠️ Workshop</option>
                <option value="conference">🎤 Conference</option>
                <option value="networking">🤝 Networking</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-starlight-white font-medium mb-2">Description *</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-starlight-white placeholder-starlight-white/50 focus:border-supernova-gold focus:ring-1 focus:ring-supernova-gold outline-none transition-all resize-none"
              placeholder="Describe your event..."
            />
          </div>

          {/* Dates and Location */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-starlight-white font-medium mb-2">Start Date *</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-starlight-white focus:border-supernova-gold focus:ring-1 focus:ring-supernova-gold outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-starlight-white font-medium mb-2">End Date *</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-starlight-white focus:border-supernova-gold focus:ring-1 focus:ring-supernova-gold outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-starlight-white font-medium mb-2">Registration Deadline *</label>
              <input
                type="date"
                required
                value={formData.registrationDeadline}
                onChange={(e) => setFormData(prev => ({ ...prev, registrationDeadline: e.target.value }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-starlight-white focus:border-supernova-gold focus:ring-1 focus:ring-supernova-gold outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-starlight-white font-medium mb-2">Location *</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-starlight-white placeholder-starlight-white/50 focus:border-supernova-gold focus:ring-1 focus:ring-supernova-gold outline-none transition-all"
                placeholder="Event location"
              />
            </div>
            <div>
              <label className="block text-starlight-white font-medium mb-2">Registration Fee (₹) *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.registrationFee}
                onChange={(e) => setFormData(prev => ({ ...prev, registrationFee: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-starlight-white placeholder-starlight-white/50 focus:border-supernova-gold focus:ring-1 focus:ring-supernova-gold outline-none transition-all"
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-starlight-white font-medium mb-2">Max Participants *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.maxParticipants}
                onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) }))}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-starlight-white focus:border-supernova-gold focus:ring-1 focus:ring-supernova-gold outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-starlight-white font-medium mb-2">
                Event Image
                <span className="text-starlight-white/60 text-sm font-normal ml-2">
                  (Max 5MB, will be compressed to under 800KB)
                </span>
              </label>
              <div className="space-y-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-starlight-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-supernova-gold file:text-space-navy file:font-medium hover:file:bg-supernova-gold/80 focus:border-supernova-gold focus:ring-1 focus:ring-supernova-gold outline-none transition-all"
                />
                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Event preview"
                      className="w-full h-32 object-cover rounded-lg border border-white/20"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview("");
                        setImageFile(null);
                        setFormData(prev => ({ ...prev, eventImage: "" }));
                      }}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm transition-colors"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-starlight-white font-medium mb-2">Requirements</label>
            {formData.requirements.map((requirement, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={requirement}
                  onChange={(e) => updateRequirement(index, e.target.value)}
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-starlight-white placeholder-starlight-white/50 focus:border-supernova-gold focus:ring-1 focus:ring-supernova-gold outline-none transition-all"
                  placeholder={`Requirement ${index + 1}`}
                />
                {formData.requirements.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRequirement(index)}
                    className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addRequirement}
              className="px-4 py-2 bg-stellar-blue hover:bg-stellar-blue/80 text-starlight-white rounded-lg transition-colors text-sm"
            >
              + Add Requirement
            </button>
          </div>

          {/* Prizes */}
          <div>
            <label className="block text-starlight-white font-medium mb-2">Prizes</label>
            {formData.prizes.map((prize, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                <input
                  type="text"
                  value={prize.position}
                  onChange={(e) => updatePrize(index, 'position', e.target.value)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-starlight-white placeholder-starlight-white/50 focus:border-supernova-gold focus:ring-1 focus:ring-supernova-gold outline-none transition-all"
                  placeholder="Position (e.g., 1st Place)"
                />
                <input
                  type="text"
                  value={prize.prize}
                  onChange={(e) => updatePrize(index, 'prize', e.target.value)}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-starlight-white placeholder-starlight-white/50 focus:border-supernova-gold focus:ring-1 focus:ring-supernova-gold outline-none transition-all"
                  placeholder="Prize description"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    value={prize.amount}
                    onChange={(e) => updatePrize(index, 'amount', parseInt(e.target.value) || 0)}
                    className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-starlight-white placeholder-starlight-white/50 focus:border-supernova-gold focus:ring-1 focus:ring-supernova-gold outline-none transition-all"
                    placeholder="Amount ($)"
                  />
                  {formData.prizes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePrize(index)}
                      className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addPrize}
              className="px-4 py-2 bg-stellar-blue hover:bg-stellar-blue/80 text-starlight-white rounded-lg transition-colors text-sm"
            >
              + Add Prize
            </button>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-starlight-white font-medium mb-2">Tags</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-starlight-white placeholder-starlight-white/50 focus:border-supernova-gold focus:ring-1 focus:ring-supernova-gold outline-none transition-all"
                placeholder="Add a tag..."
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-stellar-blue hover:bg-stellar-blue/80 text-starlight-white rounded-lg transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-cosmic-purple/30 text-starlight-white rounded-full text-sm flex items-center gap-2"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-starlight-white/70 hover:text-starlight-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Judge Assignment */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-starlight-white font-medium">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-supernova-gold rounded-full"></span>
                  Assign Judges (Optional)
                </span>
              </label>
              <button
                type="button"
                onClick={() => setShowJudgeSelection(!showJudgeSelection)}
                className="px-3 py-1 bg-stellar-blue/30 hover:bg-stellar-blue/50 text-stellar-blue hover:text-starlight-white rounded text-sm transition-colors"
              >
                {showJudgeSelection ? "Hide" : "Select"} Judges
              </button>
            </div>

            {selectedJudges.size > 0 && (
              <div className="mb-3 p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="text-starlight-white/80 text-sm mb-2">
                  Selected Judges ({selectedJudges.size}):
                </div>
                <div className="flex flex-wrap gap-2">
                  {Array.from(selectedJudges).map(judgeId => {
                    const judge = availableJudges?.find(j => j.userId === judgeId);
                    return judge ? (
                      <div
                        key={judgeId}
                        className="flex items-center gap-2 px-2 py-1 bg-supernova-gold/20 rounded-full"
                      >
                        <div className="w-6 h-6 bg-supernova-gold rounded-full flex items-center justify-center text-xs font-bold text-space-navy">
                          {judge.firstName[0]}{judge.lastName[0]}
                        </div>
                        <span className="text-starlight-white/80 text-xs">
                          {judge.firstName} {judge.lastName}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedJudges(prev => {
                              const newSet = new Set(prev);
                              newSet.delete(judgeId);
                              return newSet;
                            });
                          }}
                          className="text-starlight-white/60 hover:text-starlight-white text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {showJudgeSelection && (
              <div className="max-h-48 overflow-y-auto bg-white/5 rounded-lg border border-white/10 p-3">
                {availableJudges && availableJudges.length > 0 ? (
                  <div className="space-y-2">
                    {availableJudges.map(judge => (
                      <div
                        key={judge.userId}
                        className={`p-2 rounded-lg cursor-pointer transition-colors ${
                          selectedJudges.has(judge.userId)
                            ? "bg-supernova-gold/20 border border-supernova-gold/40"
                            : "bg-white/5 hover:bg-white/10 border border-white/10"
                        }`}
                        onClick={() => {
                          setSelectedJudges(prev => {
                            const newSet = new Set(prev);
                            if (newSet.has(judge.userId)) {
                              newSet.delete(judge.userId);
                            } else {
                              newSet.add(judge.userId);
                            }
                            return newSet;
                          });
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-stellar-blue rounded-full flex items-center justify-center text-xs font-bold text-starlight-white">
                            {judge.firstName[0]}{judge.lastName[0]}
                          </div>
                          <div>
                            <div className="text-starlight-white text-sm font-medium">
                              {judge.firstName} {judge.lastName}
                            </div>
                            <div className="text-starlight-white/60 text-xs">
                              {judge.user.email}
                            </div>
                          </div>
                          <div className="ml-auto">
                            {selectedJudges.has(judge.userId) && (
                              <div className="w-5 h-5 bg-supernova-gold rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-space-navy" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-starlight-white/60">
                    No judges available in the system
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-white/20 text-starlight-white rounded-lg hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-supernova-gold to-plasma-orange text-space-navy font-bold rounded-lg hover:scale-105 transform transition-all duration-300"
            >
              Create Event 🚀
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
