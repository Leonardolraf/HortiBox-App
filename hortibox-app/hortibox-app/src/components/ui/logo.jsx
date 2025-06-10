import React from "react";
import { Sprout } from "lucide-react";

export default function Logo({ size = "default", className = "" }) {
    const sizes = {
        small: "text-lg",
        default: "text-xl",
        large: "text-2xl",
        xlarge: "text-3xl"
    };

    const textSize = sizes[size] || sizes.default;

    return (
        <div className={`flex items-center ${className}`}>
            <div className="bg-green-500 p-2 rounded-lg mr-2 flex items-center justify-center">
                <Sprout className="text-white h-6 w-6" />
            </div>
            <div className={`font-bold ${textSize} text-green-700 flex flex-col leading-tight`}>
                <span>Horti</span>
                <span className="-mt-1.5">Box</span>
            </div>
        </div>
    );
}