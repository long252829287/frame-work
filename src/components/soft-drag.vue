<template>
<view class="drag-and-drop-sort" :containerSize="[containerSize]">
	<template v-if="controlsPositionArray.length !== 0">
		<view v-for="(item, index) in controlsArray" :key="index" class="_item"
			:style="{'transition': (currentControlIndex === index ? 'initial' : '.3s'), 'z-index': (currentControlIndex === index ? 1 : 0), 'width': controlsSize.width + 'px', 'height': controlsSize.height + 'px', 'top': controlsPositionArray[index].top + 'px',  'left': controlsPositionArray[index].left + 'px'}">
			<view @touchstart="handleTouchstart($event, index)" @touchmove.stop.prevent="handleTouchmove" @touchend="handleTouchend" :style="{'background': item}" style="width: 100%; height: 100%;">
				<slot name="content" :item="item"></slot>
			</view>
		</view>
	</template>
</view>
</template>
 
<script>
export default {
	name: "drag-and-drop-sort",
	props: {
		containerSize: {
			type: Object,
			default: () => ({ wdith: '100vw', height: '100vh' }),
		},
		controlsSize: {
			type: Object,
			default: () => ({ width: 0, height: 0 }),
		},
		controlsList: {
			type: Array,
			default: () => [],
		},
		isDrag: {
			type: Boolean,
			default: false
		}
	},
	data() {
		return {
			controlsArray: [],
			maxWidthCount: 0,
			margin: {
				margin_x: 0,
				margin_y: 0,
			},
			recordInitControlsPositionList: [],
			controlsPositionArray: [],
			recordPosition: {
				x: 0,
				y: 0,
			},
			recordControlsPositionItem: {},
			currentControlIndex: -1,
			isMobile: false,
		};
	},
	mounted() {
	},
	watch: {
		controlsList: {
			handler(list) {
				this.systemInfo = uni.getSystemInfoSync();
				this.controlsArray = list;
				this.controlsPositionArray = this.initControlsPosition();
			},
			immediate: true,
			deep: true,
		}
	},
	methods: {
		initControlsPosition() {
			let tempArray = [];
			this.maxWidthCount = parseInt(this.systemInfo.windowWidth / (this.controlsSize.width + this.margin.margin_x));
			for(let i = 0, j = 0, k = 0; i < this.controlsList.length + 1; i++) {
				tempArray[i] = {
					left: j * (this.controlsSize.width + this.margin.margin_x) + this.margin.margin_x,
					top: k * (this.controlsSize.height + this.margin.margin_y) + this.margin.margin_y,
					index: i
				}
				k = j + 1 === this.maxWidthCount ? ++k : k;
				j = j + 1 === this.maxWidthCount ? 0 : ++j;
			}
			this.recordInitControlsPositionList = [...tempArray];
			return tempArray;
		},
		handleTouchmove(event) {
			if (!this.isDrag) return;
			const { pageX, pageY } = event.touches[0];

			this.$set(this.controlsPositionArray, this.currentControlIndex, {
				left: this.controlsPositionArray[this.currentControlIndex].left + (pageX - this.recordPosition.x),
				top: this.controlsPositionArray[this.currentControlIndex].top + (pageY - this.recordPosition.y),
			});
			this.recordPosition = { x: pageX, y: pageY };
			if(this.currentControlIndex + 1 !== this.controlsList.length && (this.currentControlIndex + 1) % this.maxWidthCount !== 0 && this.controlsPositionArray[this.currentControlIndex].left + this.controlsSize.width >= this.recordInitControlsPositionList[this.currentControlIndex].left + this.controlsSize.width + this.margin.margin_x + this.controlsSize.width / 2) {
				this._handleChangeControlsPosition(this.currentControlIndex + 1);
			}
			else if(this.currentControlIndex % this.maxWidthCount !== 0 && this.controlsPositionArray[this.currentControlIndex].left <= this.recordInitControlsPositionList[this.currentControlIndex - 1].left + this.controlsSize.width / 2 && this.controlsPositionArray[this.currentControlIndex].top < this.recordInitControlsPositionList[this.currentControlIndex].top + this.controlsSize.height / 3 + this.margin.margin_y && this.controlsPositionArray[this.currentControlIndex].top > this.recordInitControlsPositionList[this.currentControlIndex].top - this.controlsSize.height / 3 - this.margin.margin_y) {
				this._handleChangeControlsPosition(this.currentControlIndex - 1);
			}
			else if(Math.ceil(this.currentControlIndex / this.maxWidthCount) !== Math.ceil(this.controlsList.length / this.maxWidthCount) && this.controlsPositionArray[this.currentControlIndex].top + this.controlsSize.height > this.recordInitControlsPositionList[this.currentControlIndex].top + this.controlsSize.height + this.margin.margin_y + this.controlsSize.height / 2) {
				this._handleChangeControlsPosition((this.currentControlIndex + this.maxWidthCount) >= this.controlsArray.length ? this.controlsArray.length - 1 : this.currentControlIndex + this.maxWidthCount);
			}
			else if(parseInt(this.currentControlIndex / this.maxWidthCount) !== 0 && this.controlsPositionArray[this.currentControlIndex].top < this.recordInitControlsPositionList[this.currentControlIndex].top - this.margin.margin_y - this.controlsSize.height / 3 * 2) {
				this._handleChangeControlsPosition(this.currentControlIndex - this.maxWidthCount);
			}
		},
		handleTouchstart(event, index) {
			if (!this.isDrag) return;
			const { pageX, pageY } = event.touches[0];
			this.currentControlIndex = index;
			this.recordPosition = { x: pageX, y: pageY };
			this.recordControlsPositionItem = this.controlsPositionArray[index];
		},
	
		handleTouchend(event) {
			if (!this.isDrag) return;
			this.controlsPositionArray[this.currentControlIndex] = this.recordInitControlsPositionList[this.currentControlIndex];
			this.currentControlIndex = -1;
		},
		_handleChangeControlsPosition(index) {
			if(this.isMobile) {
				return;
			}
			this.isMobile = true;
			let tempControls = this.controlsArray[this.currentControlIndex];
			this.controlsArray[this.currentControlIndex] = this.controlsArray[index];
			this.controlsArray[index] = tempControls;
			this.controlsPositionArray[index] = this.controlsPositionArray[this.currentControlIndex];
			this.controlsPositionArray[this.currentControlIndex] = this.recordControlsPositionItem;
			this.currentControlIndex = index;
			this.recordControlsPositionItem = this.recordInitControlsPositionList[this.currentControlIndex];
			this.isMobile = false;
		},
	}
}
</script>
 
<style scoped lang="scss">
.drag-and-drop-sort {
	position: relative;
	
	._item {
		position: absolute;
	}
}
</style>