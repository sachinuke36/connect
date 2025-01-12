class PeerService{
    public peer : RTCPeerConnection

    constructor(){
        this.getOffer = this.getOffer.bind(this);
        this.getAnswer = this.getAnswer.bind(this);
        this.setLocalDescription = this.setLocalDescription.bind(this);
        this.peer = new RTCPeerConnection({iceServers : [ { urls : "stun:stun.l.google.com:19302"}]})
    }

    async getOffer(): Promise<RTCSessionDescriptionInit | undefined> {
        if(this.peer){
            const offer = await this.peer.createOffer();
            await this.peer.setLocalDescription(new RTCSessionDescription(offer));
            return offer
        }
    }
    async getAnswer(offer: RTCSessionDescriptionInit){
        if(this.peer){
            await this.peer.setRemoteDescription(offer);
            const ans = await this.peer.createAnswer();
            await this.peer.setLocalDescription(new RTCSessionDescription(ans));
            return ans;
        }
    }
    async setLocalDescription(ans: RTCSessionDescriptionInit){
        if(this.peer){
            if (!ans || !ans.type) {
                console.error("Invalid answer received", ans);
                return;
            }
            console.log(ans)
            await this.peer.setRemoteDescription(new RTCSessionDescription(ans))
        }
    }
}

export default new PeerService();