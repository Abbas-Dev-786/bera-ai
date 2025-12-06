import { cn } from "@/lib/utils";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function ConnectBtn({className}:{className?:string}){
    return (
         <div className={cn("p-3",className)}>
        <ConnectButton 
          showBalance={false} 
          accountStatus={"full"}
          chainStatus="icon"
        />
      </div>
    )
}