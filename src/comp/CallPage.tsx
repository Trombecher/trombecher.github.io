import Peer from "peerjs";
import {toCanvas} from "qrcode";
import {createSignal, onMount} from "solid-js";

function increaseBitrate(pc: RTCPeerConnection) {
    const senders = pc.getSenders();

    senders.forEach(sender => {
        if (!sender.track) return;

        const params = sender.getParameters();
        if (!params.encodings) params.encodings = [{}];

        // Set a higher max bitrate (adjust these as needed)
        params.encodings[0]!.maxBitrate = sender.track.kind === "video"
            ? 10_000_000
            : 128_000;

        sender.setParameters(params).catch(console.error);
    });
}

export default () => {
    const [videoElement, setVideoElement] = createSignal<HTMLVideoElement | undefined>(undefined);
    const [uuid, setUuid] = createSignal("");
    const [otherPeerUUID, setOtherPeerUUID] = createSignal("");
    const [thisPeer, setThisPeer] = createSignal<Peer | undefined>(undefined);

    onMount(async () => {
        setUuid(crypto.randomUUID());

        const thisPeer = new Peer(uuid());
        setThisPeer(thisPeer);

        thisPeer.on("call", call => {
            call.answer();


            call.on("stream", async stream => {
                videoElement()!.srcObject = stream;
                await videoElement()!.play();

                increaseBitrate(call.peerConnection);
            });
        });

        thisPeer.on("open", id => {
            if(id === uuid()) return;
            setOtherPeerUUID(id);
        })

        await toCanvas(
            document.querySelector("#yooo")!,
            `https://192.168.0.64:4322/call/?id=${uuid()}`
        );

        const search = new URLSearchParams(location.search);

        const id = search.get("id") ?? undefined;
        if(id) {
            setOtherPeerUUID(id);
            search.delete(id);

            history.replaceState(null, "", `?${search.toString()}`);
        }
    });

    const startSendingVideo = async() => {
        const stream = await navigator.mediaDevices
            .getUserMedia({
                video: {
                    frameRate: 60,
                    width: 1920,
                    height: 1080,
                    facingMode: "environment",
                },
                audio: {
                    noiseSuppression: false, // disable if you want raw quality
                    sampleRate: 48000,
                    channelCount: 2,          // stereo
                    sampleSize: 16,           // bits per sample
                }
            })
            .catch(() => undefined);

        if(!stream) {
            alert("No stream")
            return;
        }

        thisPeer()!.call(otherPeerUUID(), stream);
    };

    return (
        <>
            <input
                type={"text"}
                value={otherPeerUUID()}
                oninput={e => {
                    setOtherPeerUUID(e.currentTarget.value);
                }}
                placeholder={"Other Peer UUID"}
            />
            <button
                onClick={startSendingVideo}
            >start sending video
            </button>

            {uuid()}

            <video ref={setVideoElement} width={1920} height={1080}></video>

            <canvas id={"yooo"}></canvas>
        </>
    );
}