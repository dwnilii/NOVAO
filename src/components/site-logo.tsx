'use client';

import Image from "next/image";
import { Zap } from "lucide-react";
import { useState } from "react";

interface SiteLogoProps {
    className?: string;
    iconClassName?: string;
    width?: number;
    height?: number;
}

export function SiteLogo({ className, iconClassName, width = 24, height = 24 }: SiteLogoProps) {
    const [logoError, setLogoError] = useState(false);

    if (logoError) {
        return <Zap className={iconClassName} />;
    }

    return (
        <Image
            src="/logo.svg"
            alt="Logo"
            width={width}
            height={height}
            className={className}
            onError={() => setLogoError(true)}
        />
    );
}
