/**
 * 首页-导航条
 */
function btnsNav() {
  console.log(1)
  $(".navline").css({
    width: $(".fore.active").width(),
    left: $(".fore.active").find("a").position().left,
  });
  $(".fore").hover(
    function () {
      $(".navline").css({
        width: $(this).width(),
        left: $(this).find("a").position().left,
      });
    },
    function () {
      $(".navline").css({
        width: $(".fore.active").width(),
        left: $(".fore.active").find("a").position().left,
      });
    }
  );
}

/**
 * 首页-banner轮播
 */
function bannerCarousel() {
  new Swiper(".banner-container", {
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    loop: true, // 循环模式选项
    speed: 500, //速度
    spaceBetween:20,
    autoplay: {
      delay: 5000, //自动切换的时间间隔，单位ms
      disableOnInteraction: false, //用户操作
    },
  });
}

/**
 * 首页-解决方案
 */
function solutionCcontainer(){
  new Swiper(".solution-container", {
    direction: 'vertical', // 垂直切换选项
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    loop: true, // 循环模式选项
    speed: 500, //速度
    spaceBetween: 20,
    autoplay: {
      delay: 10000, //自动切换的时间间隔，单位ms
      disableOnInteraction: false, //用户操作
    },
  });
}

/**
 * 首页-行业案例
 */
function caseBox(){
  new Swiper ('.case-container', {
    loop: true, // 循环模式选项
    speed: 500, //速度
    autoplay: {
      delay: 10000, //自动切换的时间间隔，单位ms
      disableOnInteraction: false, //用户操作
    },
    spaceBetween:20,
    // 如果需要前进后退按钮
    navigation: {
      nextEl: '.swiper-button-next_case',
      prevEl: '.swiper-button-prev_case',

    },
  })
}

/**
 * 企业文化
 */

$(document).ready(function () {
  btnsNav();
  bannerCarousel();
  solutionCcontainer();
  caseBox();
});
