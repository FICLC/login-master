function gaugeD3() {
   var radius = 90,
       thickness = 7,
       marginTop = 10;

   var arc = d3.svg.arc();
   var color = d3.scale.category20c();   
   
   var formatter = d3.format(",.1f"); 
   var commaFormatter = d3.format(",0f"); 

   function my(selection) {

      arc = d3.svg.arc()
      .outerRadius(radius-marginTop)
      .innerRadius(radius-marginTop - thickness);

      selection.each(function(data) {
         var svg = d3.select(this);


         var bbox = this.getBoundingClientRect();      
         var gEnter = svg.selectAll(".group")
                     .data([0])
                  .enter().append('g')
                     .attr('transform', "translate("+ bbox.width/2 + "," + bbox.height + ") rotate(-90)")
                     .attr('class', 'group');

         var g = svg.selectAll(".group");

         // add scale
         gEnter.append('text')
            .attr('transform', 'rotate(90)')
            .attr('x', radius - 6)
            .attr('y', 0)
            .text('0.0001');

         gEnter.append('text')
            .attr('transform', 'rotate(90)')
            .attr('x', -radius+6 )
            .attr('y', 0)
            .attr('text-anchor', 'end')
            .text('1');

         gEnter.append('text')
            .attr('transform', 'rotate(90)')
            .attr('x', radius/2 + 7)
            .attr('y', -radius/2 - 7)
            // .attr('text-anchor', 'end')
            .text('0.001');

         gEnter.append('text')
            .attr('transform', 'rotate(90)')
            .attr('x', -radius/2 - 7)
            .attr('y', -radius/2 - 7)
            .attr('text-anchor', 'end')
            .text('0.1');

         gEnter.append('text')
            .attr('transform', 'rotate(90)')
            .attr('x', 0)
            .attr('y', -radius + 9)
            .attr('text-anchor', 'middle')
            .text('0.01');

         var gArc = g.selectAll('.arc')
               .data(data)
            .enter().append("g")
               .attr("class", "arc")

         gArc.append("path")
            .attr("d", arc)         
            .style('fill', function(d,i) { 
               if (i==0)
                  return color(i) 
               else
                  return '#9ce1ff';
         });    

         g.selectAll('.arc').select('path').transition()
            .duration(200)
            .attr('d', arc);    
            
          
      });
      
   }

   my.radius = function(value) {
      if (!arguments.length) return radius;
      radius = value;
      return my;
   }

   my.thickness = function(value) {
      if (!arguments.length) return thickness;
      thickness = value;      
      return my;
   }   

   my.color = function(value) {
      if (!arguments.length) return color;
      color = value;      
      return my;
   }   

   my.klass = function(value) {
      if (!arguments.length) return klass;
      klass = value;
      return my;
   };
   
   return my;
}

