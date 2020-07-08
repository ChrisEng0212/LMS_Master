//var name = document.getElementById('name').innerHTML

var report = navigator.userAgent
console.log(report);
var device = null
var notice = null



if (report.includes('Windows')){
  device = 'A'
  notice = 'Recording in Windows'
}
else if (report.includes('Android')){
    device = 'A'
    notice = 'Recording in Android'
}
else if (report.includes('Macintosh')){
    device = 'A'
    notice = 'Recording on Mac'
}
else if (report.includes('iPad')){
    notice = 'Recording on iPad may not work; please upload file, share a link or use a phone/computer'
    device = 'I'
}
else if (report.includes('iPhone OS 11')){ 
    device = 'I'
    notice = 'Recording in iOS 11'
}      
else if (report.includes('iPhone OS 12')){ 
  device = 'I'
  notice = 'Recording in iOS 12'
}
else if (report.includes('iPhone OS 13')){ 
  device = 'I'
  notice = 'Recording in iOS 13'
}
else {
  device = 'U'
  notice = 'Your iOS may not work; if so try upload a file, share a link, or use a computer'
}
console.log('DEVICE', device);

//iphone recording
window.globalFunc = function (action){
  console.log('global started');
  window.URL = window.URL || window.webkitURL;
  /** 
   * Detect the correct AudioContext for the browser 
   * */
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  navigator.getUserMedia  = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
  var recorder = new RecordVoiceAudios();    
  
  
  if (action == 'start'){
    recorder.startRecord()
    console.log('recorder start');
  }
  else if (action == 'stop'){
    recorder.stopRecord();
  }
 
  function RecordVoiceAudios() {
      
      let encoder = null;
      let microphone;        
      
      var audioContext;        
      let processor; 
      let config = {
          bufferLen: 4096,
          numChannels: 2,
          mimeType: 'audio/mpeg'
      };
      console.log('load rec voice'); 

      this.startRecord = function() {
        console.log('startRecord');
          audioContext = new AudioContext();
          /** Create a ScriptProcessorNode with a bufferSize of 
          * 4096 and two input and output channel 
          * */
          if (audioContext.createJavaScriptNode) {
              processor = audioContext.createJavaScriptNode(config.bufferLen, config.numChannels, config.numChannels);
              console.log('java processer');
          } else if (audioContext.createScriptProcessor) {
              processor = audioContext.createScriptProcessor(config.bufferLen, config.numChannels, config.numChannels);
              console.log('script processer');
          } else {
              console.log('WebAudio API has no support on this browser.');
          }
          processor.connect(audioContext.destination);
          /**
          *  ask permission of the user for use microphone or camera  
          * */
          navigator.mediaDevices.getUserMedia({ audio: true, video: false })
          .then(gotStreamMethod)
          .catch('logError');
      };

      let getBuffers = (event) => {
          var buffers = [];
          for (var ch = 0; ch < 2; ++ch)
              buffers[ch] = event.inputBuffer.getChannelData(ch);
          return buffers;
      }

      let gotStreamMethod = (stream) => {

          config = {
              bufferLen: 4096,
              numChannels: 2,
              mimeType: 'audio/mpeg'
          };

          let tracks = stream.getTracks();
          /**Create a MediaStreamAudioSourceNode for the microphone **/
          microphone = audioContext.createMediaStreamSource(stream);
          /**connect the AudioBufferSourceNode to the gainNode **/
          microphone.connect(processor);          
          encoder = new Mp3LameEncoder(audioContext.sampleRate, 160); //bitRate set to 160 
          /** Give the node a function to process audio events **/
          processor.onaudioprocess = function(event) {
              encoder.encode(getBuffers(event));
              console.log('MP3 encoding');
          };

          stopBtnRecord = () => {                   
                  var stage = 1                          
                  console.log('stop Record');
                  audioContext.close();
                  processor.disconnect();
                  tracks.forEach(track => track.stop());                  
                  stage = 2
                  audioElement = document.getElementById('handler')   
                  audioElement.src = URL.createObjectURL(encoder.finish());                  
                  stage = 3 

                  globlob = audioElement.src

                    fetch(audioElement.src)
                    .then( response => response.blob() )
                    .then( blob =>{                        
                        var reader = new FileReader();
                        reader.readAsDataURL(blob);	
                        reader.onload = function(){ 
                            var base64data = this.result.split(',')[1]  // <-- this.result contains a base64 data URI 
                            b64d = base64data                                             
                        }; //end reader.onload 
                                         
                    })//end fetch then
                    .catch((error) => {                      
                      console.log(error);
                      recErrorWin(error);
                    })
                  return stage
                               
          };// stopRecord          
      }
      this.stopRecord = function() {
        try{
          var stage = stopBtnRecord()
          console.log(stage);
        }
        catch {
          recErrorWin('Apple fail before fetch');
        }

      }; 
  }
}


//device = 'U'
let b64d = 'nothing'
let globlob = 'noURL'


startVue()

function startVue(){ 
  
  let vue = new Vue({   

    el: '#vue-app',
    delimiters: ['[[', ']]'],   
    mounted: function () {      
      
      if (device == 'U'){
        this.showUpload('up')
      }      
    },   
    data: {        
        notice : notice,        
        device: device,           
        rec1: {          
            start : true,
            stop : false, 
            save : false, 
            cancel : false, 
            timer : false,
            t_style: false,  
            count : false 
        },    
        mediaRecorder : null,
        audio_source : null,
        base64data : null, 
        blobURL : null, 
        upload : false 
    }, 
    methods: {
      start : function(){    
        vue.rec1.start = false
        vue.rec1.stop = true  
        vue.rec1.timer = true
        vue.timer()
        
        if (this.device == 'A') {   
        var constraintObj = {audio: true, video: false };
        navigator.mediaDevices.getUserMedia(constraintObj)
            .then(function(mediaStreamObj) {     
                vue.mediaRecorder = new MediaRecorder(mediaStreamObj);
                var chunks = [];                      
                vue.mediaRecorder.start(); 
                console.log('status:' + vue.mediaRecorder.state);
            
              vue.mediaRecorder.ondataavailable = function(ev) {
                chunks.push(ev.data);    
              }

              vue.mediaRecorder.onstop = (ev)=>{
                    try{                
                      var blob = new Blob(chunks, { 'audio' : 'audio/mpeg;' });
                      console.log(blob);
                      chunks = [];// here we clean out the array
                      var blobURL = window.URL.createObjectURL(blob);
                      console.log(blobURL);         
                      //get the base64data string from the blob
                      reader = new FileReader();
                      reader.readAsDataURL(blob); 
                      reader.onloadend = function() {
                        vue.base64data = reader.result.split(',')[1]; //remove padding from beginning of string
                        vue.blobURL = blobURL            
                      }
                    }
                    catch(err) {                  
                      console.log(err.message);
                      vue.recError(err.message) 
                    }
                }        
             })
          }
          else if (this.device == 'I'){
            // global function for iphone recording
            window.globalFunc('start') 
          }
      },
      stop: function(task){

        vue.rec1.stop = false
        vue.rec1.save = true
        vue.rec1.cancel = true
        clearInterval(vue.rec_timer)
        console.log(this.device);
               
            if (this.device == 'A') {  
              console.log('stopped');              
              vue.mediaRecorder.stop();               
              console.log('status:' + vue.mediaRecorder.state);
            }
            else if (this.device == 'I'){
              // global function for iphone recording              
              window.globalFunc('stop')
              vue.blobURL = globlob              
              console.log('status: mp3 rec stopped');          
            } 
          
               
      },  
      cancel: function(){
        console.log('cancel');
        for (var key in vue.rec1){
        vue.rec1[key] = false          
        }
        vue.rec1.start = true 
        
        vue.show['1'] = true
        vue.show['2'] = true
        vue.base64data = null
        vue.blobURL = null 
        
      },         
      save : function (task, mark){
        if (this.device == 'I'){
          vue.base64data = b64d          
        }  
        

        $.ajax({
          data : {    
              base64 : vue.base64data,   
          },
          type : 'POST',
          url : '/dubUpload'                    
          })
          .done(function(data) {
              alert(data)                        
          })
          .fail(function(){
            alert('Upload Failed, there has been an error. Reload the page and if it happens again please tell you instructor')
          });          
          
      },      
            
      timer : function (task){
        vue.rec_timer = setInterval(function() { 
            if (vue.rec1.count) {
              console.log(vue.rec1.count);
            }
            else{
              vue.rec1.count = 0
            }
            
            vue.rec1.count += 1  
            if (vue.rec1.count == 91){               
                vue.stop(task)
                console.log('timer_terminated');                                    
            } 
            else {                
                var width =  vue.rec1.count + '%'
                var color = 'indianred'  
                if (vue.rec1.count > 80){
                  color = 'red'
                }             
                else if (vue.rec1.count > 30){
                  color = 'mediumseagreen'
                }
                else if (vue.rec1.count > 20) {
                  color = 'khaki'
                }
                else if (vue.rec1.count > 10) {
                  color = 'coral'
                }
                vue.rec1.t_style = { height:'30px', width:width, background:color, color:'white', 'border-radius': '5px', border: '1px solid white' }                
            }
          }, 1000)
      },
      playAudio : function () {                 
        player = document.getElementById('handler')   

        player.src = null
       
      }, 
      clip : function (arg){        
        video = document.getElementById('vid')
        audio = document.getElementById('aud')
        video.currentTime = 0 
        if (arg == 'sound'){   
          video.muted = false      
          video.play()
        }        
        if (arg == 'mute'){
          video.muted = true            
          video.play()
        }        
        if (arg == 'shadow') {
          video.muted = false
          video.play()
          audio.play()
        }
        if (arg == 'dub') {
          video.muted = true 
          video.play()
          audio.play()
        }


      }
    } // end methods    
    
    
    
})// end NEW VUE

}// endFunction 


