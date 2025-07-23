
import { cn } from "@/lib/utils";
import React from "react";

interface PageTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
    children: React.ReactNode;
}

export function PageTitle({ children, className, ...props }: PageTitleProps) {
    return (
        <h1 className={cn("text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-8", className)} {...props}>
            {children}
        </h1>
    );
}
