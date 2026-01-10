import { RenderBuilderContent } from "@/components/builder-page";

const model = "page";

// Builder Public API Key set in .env.local
const BUILDER_PUBLIC_API_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY || "YOUR_PUBLIC_API_KEY";

export async function generateStaticParams() {
    try {
        const { builder } = await import("@builder.io/sdk");
        builder.init(BUILDER_PUBLIC_API_KEY);

        const pages = await builder.getAll("page", {
            options: { noTargeting: true },
            apiKey: BUILDER_PUBLIC_API_KEY,
        });

        // specific workaround for output: export
        // if no pages found (e.g. no API key), return a dummy path so build doesn't fail
        if (!pages || pages.length === 0) {
            return [{ page: ['builder-preview'] }];
        }

        return pages.map((page) => ({
            page: page?.data?.url?.split("/").filter(Boolean),
        }));
    } catch (error) {
        // console.error("Failed to fetch page params", error);
        return [{ page: ['builder-preview'] }];
    }
}

interface PageProps {
    params: Promise<{
        page: string[];
    }>;
}

export default async function Page(props: PageProps) {
    const params = await props.params;
    let content = undefined;

    try {
        const { builder } = await import("@builder.io/sdk");
        builder.init(BUILDER_PUBLIC_API_KEY);

        content = await builder
            .get(model, {
                userAttributes: {
                    urlPath: "/" + (params.page?.join("/") || ""),
                },
            })
            .toPromise();
    } catch (err) {
        console.error("Builder fetch error:", err);
    }

    return (
        <RenderBuilderContent content={content || undefined} model={model} />
    );
}
