"use client";
import { ComponentProps } from "react";
import { BuilderComponent, useIsPreviewing } from "@builder.io/react";
import { BuilderContent } from "@builder.io/sdk";
import DefaultErrorPage from "next/error";
import "../builder-registry";

type BuilderPageProps = ComponentProps<typeof BuilderComponent>;

// Builder Public API Key set in .env.local
const BUILDER_PUBLIC_API_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY || "YOUR_PUBLIC_API_KEY";

export function RenderBuilderContent({ content, model }: BuilderPageProps) {
    // Call the useIsPreviewing hook to determine if the page is being previewed in Builder
    const isPreviewing = useIsPreviewing();
    // If "content" is available, the section is not empty, and the page is being previewed in Builder, render the BuilderComponent
    if (content || isPreviewing) {
        return (
            <BuilderComponent
                content={content}
                model={model}
                apiKey={BUILDER_PUBLIC_API_KEY}
            />
        );
    }
    // If the "content" is unavailable and the page is not being previewed in Builder, render the DefaultErrorPage with a 404.
    return <DefaultErrorPage statusCode={404} />;
}
