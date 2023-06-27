<template>
<div class="search-warp">
    <div class="search-area" :class="{'active-search': this.inActive}">
        <input class="search-input" placeholder="搜索感兴趣的内容" v-model="searchValue" @focus="inputActive(true)" @blur="inputActive(false)" @keyup.enter="toSearch(searchValue)"/>
    </div>
    <div class="show-hide-search" :class="{'active-search-icon': this.inActive}" @click.stop="toSearch(searchValue)">
        <i class="iconfont icon-search"></i>
    </div>
</div>
</template>
<script>
export default {
    name: 'search-input',
    data() {
        return {
            searchValue: '',
            inActive: false,
            screenWidth: 0
        };
    },
    methods: {
        inputActive(boolean) {
            this.inActive = boolean;
        },
        toSearch(val) {
            this.inActive = true;
            setTimeout(() => {
                document.addEventListener('click', this.hideSearchActive);
            }, 50);
            if (!val) {
                return false;
            } else {
                this.$emit('search', {searchVal: val})
                // this.$message.success('e点点w点点q点点');
            }
        },
        hideSearchActive() {
            document.removeEventListener('click', this.hideSearchActive);
            this.inActive = false;
        }
    },
    mounted() {
        this.screenWidth = document.body.clientWidth;
        window.onresize = () => {
            return (() => {
                this.screenWidth = document.body.clientWidth;
            })();
        };
    }
};
</script>
<style lang="scss" scoped>
.search-warp {
    float: right;
    margin: 12px 16px 12px 0;
    position: relative;
    display: block;
    .search-area {
        height: 36px;
        width: 280px !important;
        background: #f3f5f6;
        border-radius: 8px;
        box-sizing: border-box;
        padding-right: 56px;
        margin: 0;
        display: block;
        transition: .3s all linear;
        box-sizing: border-box;
        .search-input {
            height: 36px;
            box-sizing: border-box;
            border-top-left-radius: 8px;
            border-bottom-left-radius: 8px;
            padding: 8px 12px;
            font-size: 14px;
            line-height: 24px;
            width: 100%;
            float: left;
            border: none;
            outline: 0;
            -webkit-transition: background-color .3s;
            -moz-transition: background-color .3s;
            transition: background-color .3s;
            background-color: transparent;
            -moz-box-sizing: border-box;
            -webkit-box-sizing: border-box;
            -ms-box-sizing: border-box;
            box-sizing: border-box;
            border: 1px solid #f3f5f6;
            &:focus {
                background: #FFFFFF;
                border: 1px solid #545c63;
            }
        }
    }
    .show-hide-search {
        width: 56px;
        height: 36px;
        text-align: center;
        position: absolute;
        top: 0;
        right: 0;
        padding: 0;
        bottom: 24px;
        border-radius: inherit;
        border-top-right-radius: 8px;
        border-bottom-right-radius: 8px;
        transition: .3s all linear;
        display: inline-block;
        border-bottom: 1px;
        > i {
            width: 100%;
            height: 36px;
            line-height: 36px;
            font-size: 24px;
            transition: .3s all linear;
            display: block;
            color: #545c63;
            cursor: pointer;
        }
    }
    .active-search {
        box-shadow: 0 0 0 4px #dfe1e2ec;
    }
    .active-search-icon {
        background: #545c63;
        > i {
            color: #FFF;
        }
    }
}
</style>
