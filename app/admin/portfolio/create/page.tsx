import { uploadImage } from "@/lib/uploadImage";
import { Image as ImageIcon } from "lucide-react";

export default function CreatePortfolio() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        project_url: '',
        image_url: ''
    });

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setUploading(true);
        const file = e.target.files[0];

        const { url, error } = await uploadImage(file, 'images');

        if (error) {
            alert(`Error uploading image: ${error}`);
        } else {
            setFormData({ ...formData, image_url: url });
        }
        setUploading(false);
    };

    const handleSave = async () => {
        if (!formData.title || !formData.category) {
            alert("Title and Category are required");
            return;
        }

        setLoading(true);
        const { error } = await supabase.from('portfolio').insert([formData]);

        if (error) {
            console.error('Error creating project:', error);
            alert('Failed to create project');
        } else {
            router.push('/admin/portfolio');
        }
        setLoading(false);
    };

    return (
        <main className="bg-gray-50 dark:bg-zinc-950 min-h-screen text-foreground">
            <div className="pt-24 pb-12 px-6 max-w-3xl mx-auto">
                <Link href="/admin/portfolio" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to List
                </Link>

                <h1 className="text-4xl font-oswald font-bold uppercase mb-8">Add New Project</h1>

                <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800 space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-bold uppercase text-gray-500 mb-2">Project Title</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-primary transition-colors"
                            placeholder="e.g. E-Commerce Redesign"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-bold uppercase text-gray-500 mb-2">Category</label>
                        <select
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-primary transition-colors"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option value="">Select Category</option>
                            <option value="Web Development">Web Development</option>
                            <option value="Mobile App">Mobile App</option>
                            <option value="Design">Design</option>
                            <option value="Consulting">Consulting</option>
                        </select>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-bold uppercase text-gray-500 mb-2">Project Image</label>

                        {formData.image_url ? (
                            <div className="relative aspect-video rounded-lg overflow-hidden mb-4 border border-gray-200 dark:border-zinc-800">
                                <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                    onClick={() => setFormData({ ...formData, image_url: '' })}
                                    className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full hover:bg-red-600 transition-colors text-sm"
                                >
                                    Remove
                                </button>
                            </div>
                        ) : (
                            <div className="border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-lg p-8 flex flex-col items-center justify-center text-gray-400 mb-4 hover:border-primary/50 transition-colors relative cursor-pointer">
                                <ImageIcon className="w-8 h-8 mb-2" />
                                <span className="text-xs">Click to upload image</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    disabled={uploading}
                                />
                            </div>
                        )}

                        {uploading && <p className="text-xs text-center text-primary animate-pulse mb-4">Uploading...</p>}

                        <input
                            type="text"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-primary transition-colors text-sm"
                            placeholder="Or enter image URL..."
                            value={formData.image_url}
                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        />
                    </div>

                    {/* Project URL */}
                    <div>
                        <label className="block text-sm font-bold uppercase text-gray-500 mb-2">Project Link (Optional)</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-primary transition-colors"
                            placeholder="https://client-site.com"
                            value={formData.project_url}
                            onChange={(e) => setFormData({ ...formData, project_url: e.target.value })}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-bold uppercase text-gray-500 mb-2">Description</label>
                        <textarea
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-primary transition-colors h-40 resize-none"
                            placeholder="Describe the project..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full py-4 bg-primary text-white font-bold uppercase tracking-wider rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                        {loading ? 'Saving...' : 'Create Project'}
                    </button>
                </div>
            </div>
        </main>
    );
}
