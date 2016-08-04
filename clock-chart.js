/**
 * Created by code_for_fun on 8/4/16.
 * 时钟图表
 * opts : {
 *  container: id,             //svg id
 *  data: []                   //clock_data
 *  content: {                 //中间显示的内容
 *    text: "",
 *    subtext: ""
 *  }
 * }
 * todo: 1, 优化中间内容显示  2, 动画由逐渐出现改成生长 3, UI改进
 */

function ClockChart(opts) {
  this.init(opts);
}

ClockChart.prototype = {

  init: function(opts) {
    if(!opts.container) {
      console.error("缺少svg容器id");
      return;
    }
    this._opts = opts;
    this.render();
    this.onResize();
  },

  render: function() {
    var svg_id = this._opts.container;
    var data = this._opts.data || [];
    var content = this._opts.content || "";
    var colors = {
      inner_circle : "#eee",      //中心背景颜色
      outer_circle : "#00A5E0",   //圆环颜色（时钟背景色）
      bar : "#01579b",            //外围柱子颜色
      bar_hover: "#00A5E0"          //外围柱子选中颜色
    }
    var svg = d3.select('#' + svg_id);
    svg.selectAll('*').remove();    //先清除后创建
    //主体信息
    var postion_info = svg.node().getBoundingClientRect();
    var width = postion_info.width, height = postion_info.height;
    var center_x = width/2, center_y = height/2;
    //圆信息
    var r = 100, stroke_width = 50;
    var hours = [24,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
    //1,画时钟，显示刻度
    svg.append('circle')
      .attr('cx', center_x)
      .attr('cy', center_y)
      .attr('r', r)
      .attr('stroke', colors.outer_circle)
      .attr('stroke-width', stroke_width)
      .attr('fill', colors.inner_circle)
    svg.append('g')
      .selectAll('text')
        .data(hours)
        .enter()
        .append('text')
          .attr('x', function(h){ return center_x +  Math.sin( 2 * Math.PI / 24 * h ) * r; })
          .attr('y', function(h){ return center_y -  Math.cos( 2 * Math.PI / 24 * h ) * r + 5; })
          .attr('stroke', 'white')
          .attr('text-anchor', 'middle')
          .attr('fill', 'white')
          .text(function(h){ return h })
    //2,画中间内容
    renderContent(this._opts.content);
    //3,画柱子
    var clock_data = [];
    hours.forEach(function(x, i) {
      clock_data.push({key:x, value: data[i] })
    });
    var max = center_x > center_y ? center_y - r - stroke_width : center_x - r - stroke_width;
    var scale = d3.scaleLinear().domain([0, d3.max(data)]).range([0, max]);   //比例尺
    var arc = d3.arc().innerRadius(128);
    var arcs = svg.append('g')
      .selectAll('g')
        .data(clock_data)
        .enter()
        .append('g')
          .attr("transform","translate("+center_x+","+center_y+")")
          .on("mouseover", function(item){onOver(this,item)} )
          .on("mouseout", function(){onExit(this)} )
    arcs.append("path")
      .attr("fill", colors.bar)
      .transition()
        .duration(300)
        .delay( function(d,i){ return (i+1)*50; } )
      .attr("d", function(d){
        return arc({
          outerRadius: r + stroke_width + scale(d.value),
          startAngle: d.key%24 * Math.PI/12 - Math.PI/24,
          endAngle: (d.key%24 + 1) * Math.PI/12 - Math.PI/24
        });
      })
    function onOver(target, item) {
      renderContent({text: item.value, subtext: item.key + "点"});
      //高亮当前部分
      d3.select(target)
        .select('path')
        .attr('fill', colors.bar_hover);
    }

    function onExit(target) {
      renderContent(content);
      //移除高亮
      d3.select(target)
        .select('path')
        .attr('fill', colors.bar);
    }

    function renderContent(content) {
      svg.selectAll('.content').remove();
      svg.append('text')
        .attr('class', 'content')
        .attr('x', center_x)
        .attr('y', center_y)
        .attr('text-anchor', 'middle')
        .style('font-size', '25px')
        .text(content.text)
      svg.append('text')
        .attr('class', 'content')
        .attr('x', center_x)
        .attr('y', center_y + 25)
        .attr('text-anchor', 'middle')
        .style('font-size', '20px')
        .attr('stroke', 'grey')
        .attr('fill', 'grey')
        .text(content.subtext)
    }
  },

  onResize: function() {
    var _this = this;
    var temp = window.onresize;
    window.onresize = function() {
      if(temp) {
        temp();
      }
      resizeOrNot();
    }
    //实现onresizeend
    var resize_timer = null;
    function resizeOrNot() {
      if(resize_timer) {
        clearTimeout(resize_timer);
      }
      resize_timer = setTimeout(_this.render.bind(_this), 300);
    }
  },

  _opts: null
};

window.ClockChart = ClockChart;
