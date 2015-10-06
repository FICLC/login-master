function sunburstD3() {
  var margin = {top: 10, right: 10, bottom: 10, left: 10},
      width = 200,
      height = 200,
      defaultOptions = {klass:'', 'text' : true, 'click': true, 'mouseover': true, 'idPrefix': '', transitionDuration:750, pixelFilter:true},
      color = d3.scale.category20c(),
      radius = Math.min(width, height) / 2,            
      x = d3.scale.linear().range([0, 2 * Math.PI]),
      y = d3.scale.sqrt().range([0, radius]),       
      arc = d3.svg.arc()
        .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
        .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
        .innerRadius(function(d) { return Math.max(0, y(d.y)); })
        .outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });

  var node;
  var partition = d3.layout.cumulativePartition().sort(null).value(function(d) { return d.count; });

  var click = function() { return; };
      
  function chart(selection, opts) {
    var me  = this;
    // merge options and defaults
    var options = $.extend({}, defaultOptions, opts);    
    var innerHeight = height - margin.top - margin.bottom;
    // recalc radius & y scale & arc
    radius = Math.min(width, height) / 2;              
    y = d3.scale.sqrt().range([0, radius]);
    arc = d3.svg.arc()
        .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x))); })
        .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx))); })
        .innerRadius(function(d) { return Math.max(0, y(d.y)); })
        .outerRadius(function(d) { return Math.max(0, y(d.y + d.dy)); });

    // process selection
    selection.each(function(data) {
      me.data = data;
      // set svg element
      var svg = d3.select(this);

      // Select the g element, if it exists.
      var g = svg.selectAll("g").data([0]);

      // Otherwise, create the skeletal chart.
      var gEnter = g.enter().append("g")
          .attr("transform", "translate(" + width / 2 + "," + (height / 2 + 10) + ")");

      // update      
      //partition.nodes(data); // call to set depth data
      // downSampleTree(data,4);     

      // enter
      if (options.pixelFilter)
        var path = g.selectAll(".path")
                .data(partition.nodes(data).filter(function(d){
                  return x(d.dx) > 0.003;
                }),
                function(d) { return d.id; })
      else
        var path = g.selectAll(".path")
                .data(partition.nodes(data), function(d) { return d.id; })
      if (node == undefined)
        node = path.data()[0];        

      // exit
      path.exit().remove();
      
      //  update any paths that stuck around (e.g. viruses is in both phage and viral sunbursts)
      g.selectAll('.path').select('path')
        .style("fill", function(d,i) {                             
            if(i == 0) return 'white';              
            else if(d.depth ==1 || d.depth == 2) return color(d)(d.id);
            else {
              var datum = d;
              var depth = Math.min(d.depth,6);
              while (datum.depth > 2) {
                datum = datum.parent;
              }
              var cscale = color(datum);
              var c = d3.hsl(cscale(datum.id)).brighter(depth/4);
              return c;
              // return color((d.children ? d : d.parent)); })
            };
        })

      // enter
      var gPath = path.enter().append('g')
              .attr('class', 'path');

      gPath.append("path")            
            .attr("d", arc)
            .attr('id', function(d) { return options.idPrefix + d.id; })
            .style("fill", function(d,i) {                             
              if(i == 0) return 'white';              
              else if(d.depth ==1 || d.depth == 2) return color(d)(d.id);
              else {
                var datum = d;
                var depth = Math.min(d.depth,6);
                while (datum.depth > 2) {
                  datum = datum.parent;
                }
                var cscale = color(datum);
                var c = d3.hsl(cscale(datum.id)).brighter(depth/4);
                return c;
                // return color((d.children ? d : d.parent)); })
              }
            })
            .on("click", clickHandler)
            .on("mouseover", function(d,i) {
              if(i == 0 || !options.mouseover) return;  
                div.transition()        
                   .duration(200)      
                   .style("opacity", .9);   
                var category = d.name.split(':')[0];  
                if (category == 'no rank')
                  div.html(d.name.split(':')[1] + ' - ' + d.count + ' read(s)')
                else
                  div.html(d.name + ' - ' + d.count + ' read(s)')
             .style("left", (d3.event.pageX) + "px") 
             .style("text-align", 'left')    
             .style("top", (d3.event.pageY - 24) + "px");    
             })                  
             .on("mouseout", function(d) {       
                div.transition()        
                   .duration(500)      
                   .style("opacity", 0);   
             }).each(stash);
      
      if (options.text) {
        var text = gPath.append('text')                       
              .attr('x', function(d) { return 0; })
              .attr('dy', function(d) {return (y(d.y + d.dy) - y(d.y))/2;})        
              .attr('dx', function(d) {
                var sa = x(d.x);
                var ea = x(d.x + d.dx);
                var angle = ea - sa;
                var r = y(d.y) + (y(d.y + d.dy) - y(d.y))/2;
                return (angle*r)/2 ;
              })

        text.append("textPath")   
            .attr('id', function(d) { return d.id + '-text'})     
            .attr('class', 'textpath')       
            .attr("xlink:href",function(d) { return '#' + d.id; })
            .attr('alignment-baseline', "middle")
            .attr('text-anchor', "middle")
            .style('height', '10px')
            .text(function(d,i) {              
              var pathId = d.id.split('-text')[0];
              var name = d.name.split(':')[1];              
              this.textContent = name;
              
              // get arc length, s
              var sa = x(d.x);
              var ea = x(d.x + d.dx);
              var angle = ea - sa;
              var r = y(d.y) + (y(d.y + d.dy) - y(d.y))/2;
              var s = angle*r;

              var fontsize = 15;
              for (var k=fontsize; k >=9; k--) {
                this.style.fontSize = k;
                if (this.getComputedTextLength() <= s)
                  return name;
              }
              return '';
            });
      }

      // update       
      g.selectAll('.path').select('path').transition()
        .duration(options.transitionDuration)
        .attrTween("d", arcTweenData);          
        
      g.selectAll('.path').select('text').transition()
          .duration(options.transitionDuration)          
          .attr('x', function(d) { return 0; })
          .attr('dy', function(d) {return (y(d.y + d.dy) - y(d.y))/2;})        
          .attr('dx', function(d) {
            var sa = x(d.x);
            var ea = x(d.x + d.dx);
            var angle = ea - sa;
            var r = y(d.y) + (y(d.y + d.dy) - y(d.y))/2;
            return (angle*r)/2 ;
          })

      g.selectAll('.path').select('.textpath').transition()
        .duration(options.transitionDuration)
        .text(function(d,i) {
          var pathId = d.id.split('-text')[0];
          var name = d.name.split(':')[1];              
          this.textContent = name;          

          // get arc length, s
          var sa = x(d.x);
          var ea = x(d.x + d.dx);
          var angle = ea - sa;
          var r = y(d.y) + (y(d.y + d.dy) - y(d.y))/2;
          var s = angle*r-2;

          if (pathId == 'b192') {
            console.log('s = ' + s)
            var h = 5;
          }

          var fontsize = 15;
          for (var k=fontsize; k >=9; k--) {
            this.style.fontSize = k;
            if (this.getComputedTextLength() <= s)
              return name;
          }
          return '';
      })    
      


      d3.select(self.frameElement).style("height", height + "px");    
      
    }); // end selection.each
  
    // click hanlder
    function clickHandler(d) {   
      node = d;   
      // if (node.name == 'root:root') return; // ignore root clicks
      if (node.parent && node.parent.name.split(':')[1] == 'root') {
        d = node.parent;        
      }
      if (options.click) {
        
        // if(y(d.y) <= 20) {return} // do nothing for center rings
        // selection.selectAll('text').remove();
        var endX = d3.scale.linear().range([0, 2 * Math.PI]).domain([d.x, d.x+d.dx])

       // selection.selectAll('path')
       if (options.pixelFilter)
        var path = selection.select('g').selectAll(".path")
                .data(partition.nodes(data).filter( function(n) {
                  return ((endX(n.x+n.dx) - endX(n.x)) > 0.003);
                }), 
                function(d) { return d.id; })
      else
        var path = selection.select('g').selectAll(".path")
                .data(partition.nodes(data), function(d) { return d.id; })

      path.exit().remove();

      var gPath = path.enter().append('g')
              .attr('class', 'path');

      gPath.append("path")            
            .attr("d", arc)
            .attr('id', function(d) { return options.idPrefix + d.id; })
            .style("fill", function(d,i) { 
              if(i == 0) return 'white';              
              else if(d.depth ==1 || d.depth == 2) return color(d)(d.id);
              else {
                var datum = d;
                var depth = Math.min(d.depth,6);
                while (datum.depth > 2) {
                  datum = datum.parent;
                }
                var cscale = color(datum);
                var c = d3.hsl(cscale(datum.id)).brighter(depth/5);
                return c;
                // return color((d.children ? d : d.parent)); })
              }
            })
            .on("click", clickHandler)
            .on("mouseover", function(d,i) {
              if(i == 0 || !options.mouseover) return;  
                div.transition()        
                   .duration(200)      
                   .style("opacity", .9);   
                var category = d.name.split(':')[0];  
                if (category == 'no rank')
                  div.html(d.name.split(':')[1] + ' - ' + d.count)
                else
                  div.html(d.name + ' - ' + d.count)
             .style("left", (d3.event.pageX) + "px") 
             .style("text-align", 'left')    
             .style("top", (d3.event.pageY - 24) + "px");    
             })                  
             .on("mouseout", function(d) {       
                div.transition()        
                   .duration(500)      
                   .style("opacity", 0);   
             }).each(stash);

        selection.selectAll('.path').select('path').transition()
          .duration(750)
          .attrTween("d", arcTween(d))
          .call(endall, function() { 
            click(node); 
            selection.selectAll('text')
              .attr('x', function(d) { return 0; })
              .attr('dy', function(d) {return (y(d.y + d.dy) - y(d.y))/2;})        
              .attr('dx', function(d) {
                var sa = x(d.x);
                var ea = x(d.x + d.dx);
                var angle = ea - sa;
                var r = y(d.y) + (y(d.y + d.dy) - y(d.y))/2;
                return (angle*r)/2;
              })
            selection.selectAll('.textpath')
              .text(function(d,i) {                             
                if (d.x < x.domain()[0] || d.x >= x.domain()[1])
                  return '';
                
                // get arc length, s
                var sa = x(d.x);
                var ea = x(d.x + d.dx);
                var angle = ea - sa;
                var r = y(d.y) + (y(d.y + d.dy) - y(d.y))/2;
                var s = angle*r;

                var pathId = d.id.split('-text')[0];                                
                var name = d.name.split(':')[1];              
                this.textContent = name;
                var fontsize = 15;
                for (var k=fontsize; k >=9; k--) {
                  this.style.fontSize = k;
                  if (this.getComputedTextLength() <= s)
                    return name;                  
                }
                return '';
              })
          });
        
      }
    }
    // When zooming: interpolate the scales.
    function arcTween(d) {            
      var xd = d3.interpolate(x.domain(), [d.x, d.x + d.dx]),
          yd = d3.interpolate(y.domain(), [d.y, 1]),
          yr = d3.interpolate(y.range(), [d.y ? 20 : 0, radius]);          
      return function(d, i) {                    
        return  i
            ? function(t) { return arc(d); }
            : function(t) {              
              x.domain(xd(t)); 
              y.domain(yd(t)).range(yr(t));               
              return arc(d);};         
      };
    }

    // When switching data: interpolate the arcs in data space.
    function arcTweenData(a, i) {
      if (node == undefined) node = d3.select(this).data()[0]
      if (a.x0 == undefined || a.dx0 == undefined) {
        a.x0 = a.x + a.dx/2;
        a.dx0 = 0;
      }
      var oi = d3.interpolate({x: a.x0, dx: a.dx0}, a);
      function tween(t) {
        var b = oi(t);
        a.x0 = b.x;
        a.dx0 = b.dx;
        return arc(b);
      }
      if (i == 0) {
       // If we are on the first arc, adjust the x domain to match the root node
       // at the current zoom level. (We only need to do this once.)
        var xd = d3.interpolate(x.domain(), [node.x, node.x + node.dx]);
        return function(t) {
          x.domain(xd(t));
          return tween(t);
        };
      } else {
        return tween;
      }
    }

    // Setup for switching data: stash the old values for transition.
    function stash(d) {
      d.x0 = d.x;
      d.dx0 = d.dx;
    }

    // end of transition solution
    function endall(transition, callback) { 
      var n = 0; 
      transition 
          .each(function() { ++n; }) 
          .each("end", function() { if (!--n) callback.apply(this, arguments); }); 
    }

    // creates a tree with less nodes. replaces all the nodes past a certain depth with 
    // a single gray node per level. Allows huge trees to be visualized
    function downSampleTree(root, depth) {
      t.dfs(root, [], function(node, par, ctrl) {            
        if (node.depth > depth) {
          var sumCount = 0;
          var childrenList = undefined;
          if(node.children) {
            node.children.forEach(function(child){
              sumCount += child.count;
              if (child.children) {
                childrenList = childrenList || [];
                child.children.forEach(function(c){ childrenList.push(c); })
              }
            })
            node.children = [ {
              count : sumCount,
              children : childrenList,
              id : node.children[0].id,
              depth : node.children[0].depth,
              name : 'many',
              bin : node.children[0].bin,
              parent : node,
              x : node.children[0].x,
              y : node.children[0].y,
              dx : node.children[0].dx,
              dy : node.children[0].dy,
              value : sumCount
            }]
          }
        } 
     }) 
    }
  } // end chart function   

  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };
  
  chart.x = function(_) {
    if (!arguments.length) return x;
    x = _;
    return chart;
  };

  chart.y = function(_) {
    if (!arguments.length) return y;
    y = _;
    return chart;
  };

  chart.color = function(_) {
    if (!arguments.length) return color;
    color = _;
    return chart;
  };

  chart.click = function(_) {
    if (!arguments.length) return click;
    click = _;
    return chart;
  }

  return chart;
}