<template>
    <div class="course-detail-bottom">
        <button class="first-btn">hover me</button>
        <button class="last-btn">hover me</button>
    </div>
</template>
<script>

</script>
<style scoped lang="scss">
.course-detail-bottom {
    flex: 1;
    display: flex;
    height: 100%;
    justify-content: center;
    align-items: center;
    background: #000;
    overflow: hidden;
    > button {
        position: relative;
        height: 50px;
        width: 200px;
        margin: 0 35px;
        border-radius: 50px;
        border: none;
        outline: none;
        background: #111;
        color: #FFF;
        font-size: 20px;
        letter-spacing: 2px; // 字间距
        text-transform: uppercase; // 转换为大写
        cursor: pointer;
    }
    .first-btn:hover {
        background: linear-gradient(90deg, #03a9f4, #f441a5, #ffeb3b, #03a9f4);
        background-size: 400%;
    }
    .last-btn:hover {
        background: linear-gradient(90deg, #fa7199, #f5ce62, #e43603, #fa7199);
        background-size: 400%;
    }
    > button:first-child:before,
    > button:last-child:before{
        content: '';
        position: absolute;
        background:  inherit;
        top: -5px;
        right: -5px;
        bottom: -5px;
        left: -5px;
        border-radius: 50px;
        filter: blur(20px);
        opacity: 0;
        transition: opacity 0.5s;
    }
    > button:first-child:hover:before,
    > button:last-child:hover:before{
        opacity: 1;
        z-index: -1;
    }
    > button:hover {
        z-index: 1;
        animation: glow 8s linear infinite;
    }
    @keyframes glow {
        0%{
            background-position: 0%;
        }
        100%{
            background-position: 400%;
        }
    }
}
</style>
