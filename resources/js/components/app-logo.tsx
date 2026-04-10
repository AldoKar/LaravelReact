export default function AppLogo() {
    return (
        <>
            <div className="flex size-8 items-center justify-center overflow-hidden bg-transparent">
                <img src="/CapitalOneLogo.png" alt="Capital LIfe" className="size-full object-contain" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    Capital LIfe
                </span>
            </div>
        </>
    );
}
