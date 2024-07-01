import { SubmitButton } from "../ui/submit-button"

export default function Page() {
    return (
        <center>
            <div className="w-[360px] h-[800px] relative bg-white">
                <div className="w-[300px] h-[565px] left-[30px] top-[117px] absolute">
                <div className="w-[300px] h-12 px-[26px] py-[17px] left-0 top-[517px] absolute bg-rose-700 rounded-[5px] justify-between items-center inline-flex">
                    <button className="text-white text-2xl font-normal font-['Inter']">Abschicken</button>
                </div>
                <div className="w-[300px] h-12 px-3 py-[7px] left-0 top-[200px] absolute bg-neutral-50 rounded-[5px] border border-zinc-400 justify-between items-center inline-flex">
                    <button className="text-zinc-600 text-base font-normal font-['Inter']">Mögliche Vorlesungen</button>
                </div>
                <div className="w-[300px] h-12 left-0 top-0 absolute rounded-[5px] justify-center items-center inline-flex">
                    <input className="h-12 pl-3 pr-[206px] py-[14.50px] bg-neutral-50 rounded-[5px] border border-zinc-400 justify-start items-center inline-flex text-zinc-600 text-base font-normal font-['Inter']" 
                    placeholder="Vorname"/>
                </div>
                <div className="w-[300px] h-12 left-0 top-[60px] absolute rounded-[5px] justify-center items-center inline-flex">
                    <input className="h-12 pl-3 pr-[206px] py-[14.50px] bg-neutral-50 rounded-[5px] border border-zinc-400 justify-start items-center inline-flex text-zinc-600 text-base font-normal font-['Inter']" 
                    placeholder="Nachname"/>
                </div>
                <div className="w-[300px] h-12 left-0 top-[120px] absolute rounded-[5px] justify-center items-center inline-flex">
                    <input className="h-12 pl-3 pr-[206px] py-[14.50px] bg-neutral-50 rounded-[5px] border border-zinc-400 justify-start items-center inline-flex text-zinc-600 text-base font-normal font-['Inter']" 
                    placeholder="E-Mail"/>
                </div>
                </div>
                <div className="left-[62px] top-[16px] absolute text-center text-black text-2xl font-normal font-['Nova Round']">TutorInnenanmeldung</div>
            </div>
        </center>
    )
  }