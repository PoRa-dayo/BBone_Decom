const { createApp } = Vue;

createApp({
    data() {
        return {
            // Animation data
            animationData: null,
            sharedAnimations: {},
            plistData: null,
            animationLabels: {},
            imageCache: new Map(),
            
            // Playback state
            isPlaying: false,
            currentFrame: 0,
            frameRate: 30, // 锁定为30fps
            lastTime: 0,
            
            // Animation control
            selectedAnimation: '',
            isSegmentMode: false,
            loopSegment: false,
            segmentStartFrame: 0,
            segmentEndFrame: 0,
            
            // UI state
            isDataLoaded: false,
            totalFrames: 0,
            canvasWidth: 1200,
            canvasHeight: 500,
            animationFrameId: null
        };
    },
    
    computed: {
        currentAnimationName() {
            if (!this.isSegmentMode) return '完整动画';
            return this.selectedAnimation || '完整动画';
        }
    },
    
    methods: {
        async handleFilesUpload(event) {
            const files = Array.from(event.target.files);
            const jsonFiles = files.filter(f => f.name.endsWith('.json'));
            const imageFiles = files.filter(f => f.type.startsWith('image/'));

            if (jsonFiles.length === 0) {
                alert('请上传一个 JSON 数据文件。');
                return;
            }

            // Process JSON file
            const jsonFile = jsonFiles[0];
            try {
                const text = await jsonFile.text();
                const data = JSON.parse(text);
                
                this.animationData = data.animation || data;
                this.sharedAnimations = this.animationData.shared_animations || {};
                this.plistData = new Map((data.plist || []).map(item => [item.name, item]));
                
                const rawLabels = data.labels || {};
                this.animationLabels = {};
                for (const [name, frameNumber] of Object.entries(rawLabels)) {
                    this.animationLabels[name] = Math.max(0, frameNumber - 1);
                }
                
                if (this.animationData && this.animationData.frames) {
                    this.totalFrames = this.animationData.frames.length;
                    this.isDataLoaded = true;
                } else {
                    throw new Error('无效的动画数据格式');
                }
            } catch (error) {
                alert(`加载数据文件错误: ${error.message}`);
                console.error(error);
                return;
            }

            // Process image files
            for (const file of imageFiles) {
                const url = URL.createObjectURL(file);
                const img = new Image();
                
                await new Promise((resolve, reject) => {
                    img.onload = () => {
                        const imageName = file.name.replace(/\.[^/.]+$/, "");
                        this.imageCache.set(imageName, { img, url });
                        resolve();
                    };
                    img.onerror = reject;
                    img.src = url;
                });
            }

            if (this.isDataLoaded) {
                this.setupAnimation();
            }
        },
        
        setupAnimation() {
            this.currentFrame = 0;
            this.isPlaying = false;
            this.startAnimationLoop();
        },
        
        startAnimationLoop() {
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
            }
            
            const loop = (timestamp) => {
                this.animationFrameId = requestAnimationFrame(loop);
                
                const deltaTime = timestamp - this.lastTime;
                const frameInterval = 1000 / this.frameRate;
                
                if (this.isPlaying && deltaTime >= frameInterval) {
                    this.lastTime = timestamp - (deltaTime % frameInterval);
                    this.advanceFrame();
                }
                
                this.applyFrame(this.currentFrame);
            };
            
            this.animationFrameId = requestAnimationFrame(loop);
        },
        
        advanceFrame() {
            if (this.isSegmentMode && this.loopSegment) {
                if (this.currentFrame >= this.segmentEndFrame) {
                    this.currentFrame = this.segmentStartFrame;
                } else {
                    this.currentFrame++;
                }
            } else {
                this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
            }
        },
        
        togglePlayPause() {
            this.isPlaying = !this.isPlaying;
        },

        convertToPNG() {
            let ViewPort = document.querySelector("#viewport");
            ViewPort.style.background="none";
            html2canvas(ViewPort,{backgroundColor:null}).then(function(canvas) {
                var html="<p>Here's your PNG. Feel free to right-click on the image below and Save Picture As.</p>";
                html+="<img src='"+canvas.toDataURL()+"' alt='from canvas'/>";
                var tab=window.open();
                tab.document.write(html);
                ViewPort.style.background="";
            });
        },
        
        onFrameSliderChange(event) {
            if (this.isPlaying) {
                this.isPlaying = false;
            }
            this.currentFrame = parseInt(event.target.value, 10);
        },

        onWidthSliderChange(event) {
            this.canvasWidth = event.target.value;
            document.getElementById("MainContainer").style.width = this.canvasWidth + 'px';
        },

        onHeightSliderChange(event) {
            this.canvasHeight = event.target.value;
            document.getElementById("MainContainer").style.height = this.canvasHeight + 'px';
        },
        
        playSelectedAnimation() {
            if (!this.selectedAnimation) {
                // Play full animation
                this.isSegmentMode = false;
                this.currentFrame = 0;
            } else {
                // Play selected segment
                this.isSegmentMode = true;
                this.segmentStartFrame = this.animationLabels[this.selectedAnimation];
                
                const animationNames = Object.keys(this.animationLabels).sort((a, b) => 
                    this.animationLabels[a] - this.animationLabels[b]
                );
                const currentIndex = animationNames.indexOf(this.selectedAnimation);
                
                if (currentIndex < animationNames.length - 1) {
                    const nextAnimationName = animationNames[currentIndex + 1];
                    // 下一个动画的开始帧的前一帧作为当前动画的结束帧
                    this.segmentEndFrame = this.animationLabels[nextAnimationName] - 1;
                } else {
                    // 如果是最后一个动画，则播放到最后一帧
                    this.segmentEndFrame = this.totalFrames - 1;
                }
                
                // 确保边界值有效
                this.segmentStartFrame = Math.max(0, this.segmentStartFrame);
                this.segmentEndFrame = Math.min(this.totalFrames - 1, this.segmentEndFrame);
                
                // 确保结束帧不小于开始帧
                if (this.segmentEndFrame < this.segmentStartFrame) {
                    this.segmentEndFrame = this.segmentStartFrame;
                }
                
                this.currentFrame = this.segmentStartFrame;
                this.loopSegment = true;
            }
            
            this.isPlaying = true;
        },
        
        createBoneElement(boneData) {
            const el = document.createElement('div');
            el.className = 'bone';
            el.dataset.name = boneData.name;
            
            const staticInfo = this.plistData.get(boneData.name);
            if (staticInfo) {
                el.style.transformOrigin = 'top left';
                el.dataset.originX = staticInfo.origin_x || 0;
                el.dataset.originY = staticInfo.origin_y || 0;
                el.dataset.scaleX = staticInfo.scale_x || 1.0;
                el.dataset.scaleY = staticInfo.scale_y || 1.0;
                
                const imageName = boneData.name.replace(/\./g, '_');
                const cachedImage = this.imageCache.get(imageName);
                
                if (cachedImage) {
                    el.style.backgroundImage = `url('${cachedImage.url}')`;
                    el.style.width = `${cachedImage.img.width}px`;
                    el.style.height = `${cachedImage.img.height}px`;
                } else {
                    el.style.width = '0px';
                    el.style.height = '0px';
                }
            } else {
                el.style.width = '0px';
                el.style.height = '0px';
            }
            
            return el;
        },
        
        renderFrameBones(bones, parentElement, frameIndex, parentOpacity = 1.0) {
            bones.forEach(boneData => {
                const el = this.createBoneElement(boneData);
                
                const matrix = boneData.matrix;
                const originX = parseFloat(el.dataset.originX || 0);
                const originY = parseFloat(el.dataset.originY || 0);
                const scaleX = parseFloat(el.dataset.scaleX || 1);
                const scaleY = parseFloat(el.dataset.scaleY || 1);
                
                const matrixCSS = `matrix(${matrix.a}, ${matrix.b}, ${matrix.c}, ${matrix.d}, ${matrix.tx}, ${matrix.ty})`;
                const originCSS = `translate(${originX}px, ${originY}px)`;
                const scaleCSS = `scale(${scaleX}, ${scaleY})`;
                el.style.transform = `${matrixCSS} ${originCSS} ${scaleCSS}`;
                
                let currentOpacity = 1.0;
                if (boneData.color && boneData.color.alphaMultiplier !== undefined) {
                    currentOpacity = boneData.color.alphaMultiplier;
                }
                const finalOpacity = currentOpacity * parentOpacity;
                el.style.opacity = finalOpacity;
                
                const isEffectivelyScaled = Math.abs(matrix.a * scaleX) > 0.001 || Math.abs(matrix.d * scaleY) > 0.001;
                const isVisible = finalOpacity > 0.001 && isEffectivelyScaled;
                el.style.display = isVisible ? '' : 'none';
                
                parentElement.appendChild(el);
                
                let childrenToRender = boneData.children;
                let frameIndexForChildren = frameIndex;
                if (boneData.references_shared_animation) {
                    const sharedAnimName = boneData.references_shared_animation;
                    const sharedAnim = this.sharedAnimations[sharedAnimName];
                    if (sharedAnim && sharedAnim.length > 0) {
                        const effectiveFrameIndex = frameIndex % sharedAnim.length;
                        const sharedFrameData = sharedAnim[effectiveFrameIndex];
                        if (sharedFrameData && sharedFrameData.children) {
                            childrenToRender = sharedFrameData.children;
                            frameIndexForChildren = effectiveFrameIndex;
                        }
                    }
                }

                if (childrenToRender && childrenToRender.length > 0) {
                    this.renderFrameBones(childrenToRender, el, frameIndexForChildren, finalOpacity);
                } else {
                    // Clear any previous children if there are no new ones
                    while (el.firstChild) {
                        el.removeChild(el.firstChild);
                    }
                }
            });
        },
        
        applyFrame(frameIndex) {
            if (!this.animationData || !this.animationData.frames[frameIndex]) return;
            
            const frameData = this.animationData.frames[frameIndex];
            const armatureRoot = document.getElementById('armature-root');
            
            if (armatureRoot) {
                armatureRoot.innerHTML = '';
                this.renderFrameBones(frameData.children, armatureRoot, frameIndex, 1.0);
            }
        }
    },
    
    beforeUnmount() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        
        // Clean up object URLs
        this.imageCache.forEach(({ url }) => {
            URL.revokeObjectURL(url);
        });
    }
}).mount('#app');