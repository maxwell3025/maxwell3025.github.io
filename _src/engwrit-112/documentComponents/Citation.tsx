import * as React from "react";

export default function Citation(properties: React.PropsWithChildren<{}>){
    return <div className="w-[36rem] mx-auto"><p className="-indent-4 ml-4">{properties.children}</p></div>
}