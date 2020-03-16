//-------Calculation of data points---------------------------------------
    var plot_parameters = {"no_samples": 1024,
                           "no_samples_timeSeries": 1536,
                           "std_X1": 0.2,
                           "std_X2": 0.6,
                           "amplitude": 1,
                           "phase": 0,
                           "time": 0,
                           "frequency": 1,
                           "sqz_angle": 0,
                           "det_angle": 0,
                            "point": [0,0]
                          };

    function normal_dist(mu, sigma, nsamples){
        if(!nsamples) {nsamples = 6;}
        if(!mu) {mu=0;}
        if(sigma < 0.001) {return mu;}
        if(!sigma) {sigma = 1;}
        var run_total = 0;
        for(var i=0 ; i<nsamples ; i++){
           run_total += Math.random();
        }
        return sigma*(run_total - nsamples/2)/(nsamples/2) + mu;
    }

    function add2dvector(vector1, vector2) {
        return [vector1[0] + vector2[0], vector1[1] + vector2[1]];
    }

    function rotate(vector, angle){
        return [vector[0]*Math.cos(angle) - vector[1]*Math.sin(angle), vector[0]*Math.sin(angle) + vector[1]*Math.cos(angle)];
    }

    function get_distribution(plot_parameters){

        var no_samples = plot_parameters.no_samples;
        var std_X1 = plot_parameters.std_X1;
        var std_X2 = plot_parameters.std_X2;
        var amplitude = plot_parameters.amplitude;
        var phase = plot_parameters.phase;
        var sqz_angle = plot_parameters.sqz_angle;

        var points = [];
        for(var i=0; i < no_samples; i++){
            points[i] = add2dvector( rotate( [amplitude, 0], phase ), rotate( [normal_dist(0, std_X1), normal_dist(0,std_X2)], sqz_angle ) );
        }

        return points;
    }

    function get_timeSeries(plot_parameters, time = plot_parameters.time) {

        var no_samples = plot_parameters.no_samples_timeSeries;
        var std_X1 = plot_parameters.std_X1;
        var std_X2 = plot_parameters.std_X2;
        var amplitude = plot_parameters.amplitude;
        var phase = plot_parameters.phase;
        var frequency = plot_parameters.frequency;
        var sqz_angle = plot_parameters.sqz_angle;
        var dx = 0;

        var points = [];

        for(var i=0; i<no_samples; i++){
            dx = i * 4.2*Math.PI/no_samples - 0.1*Math.PI;
            points[i] = [dx, rotate( add2dvector( rotate( [amplitude, 0], phase ), rotate( [normal_dist(0, 3*std_X1), normal_dist(0, 3*std_X2)], sqz_angle ) ), time*frequency - dx )[0]];
        }

        return points;
    }

    function get_time_envelope(X1, X2, time = plot_parameters.time, sqz_angle = plot_parameters.sqz_angle, amplitude = plot_parameters.amplitude, phase = plot_parameters.phase, frequency = plot_parameters.frequency) {
        var uncertainty = Math.sqrt( Math.pow(X1 * Math.cos(time + sqz_angle), 2) + Math.pow(X2 * Math.sin(time + sqz_angle), 2) );
        return [amplitude * Math.cos(time + phase) + uncertainty, amplitude * Math.cos(time + phase) - uncertainty];
    }

    function get_envelope_data(plot_parameters, time=plot_parameters.time) {

        var no_samples = plot_parameters.no_samples_timeSeries/4;
        var std_X1 = plot_parameters.std_X1;
        var std_X2 = plot_parameters.std_X2;
        var amplitude = plot_parameters.amplitude;
        var phase = plot_parameters.phase;
        var frequency = plot_parameters.frequency;
        var dx = 0;

        var points = [];
        var temp;
        for(var i=0; i < no_samples; i++){
            dx = i * 4.2*Math.PI/no_samples - 0.1*Math.PI;
            temp = get_time_envelope(std_X1, std_X2, time * frequency - dx);
            points[i] = [dx, temp[0],temp[1]];
        }
        return points;
    }

    //-------Buttons----------------------------------------------------------
    var moving = false;
    var toggleDataPoints = 0;
    var currentValue = 0;
    const targetValue = 2*Math.PI;
    const coherentUncertainty = 0.25;

    const playButton = d3.select("#js-play-button");
    const datapointsButton = d3.select("#js-datapoints-button");
    const classicalFieldButton = d3.select("#js-classicalField-button");
    const vacuumStateButton = d3.select("#js-vacuumState-button");
    const coherentStateButton = d3.select("#js-coherentState-button");
    const thermalStateButton = d3.select("#js-thermalState-button");
    const vacuumSqueezedButton = d3.select("#js-vacuumSqueezed-button");
    const phaseSqueezedButton = d3.select("#js-phaseSqueezed-button");
    const amplitudeSqueezedButton = d3.select("#js-amplitudeSqueezed-button");

    datapointsButton
        .on("click", function() {
        var button = d3.select(this);
	toggleDataPoints++;
        changeDataPointsOpacity();
        //console.log("Show data points: " + toggleDataPoints);
    });

    playButton
        .on("click", function() {
        var button = d3.select(this);
        if (button.text() === "Pause") {
          moving = false;
          clearInterval(timer);
          // timer = 0;
          button.text("Play");
        } else {
          moving = true;
          timer = setInterval(step, 100);
          button.text("Pause");
        }
        //console.log("Slider moving: " + moving);
    });

    classicalFieldButton
        .on("click", function() {
            plot_parameters.std_X1 = 0.001;
            plot_parameters.std_X2 = 0.001;
            x1Slider.value(0.001);
            x2Slider.value(0.001);
            update(plot_parameters);
        });

    vacuumStateButton
        .on("click", function() {
            var amplitude = 0;
            plot_parameters.amplitude = amplitude;
            amplitudeSlider.value(amplitude);
            plot_parameters.std_X1 = coherentUncertainty;
            plot_parameters.std_X2 = coherentUncertainty;
            x1Slider.value(coherentUncertainty);
            x2Slider.value(coherentUncertainty);
            update(plot_parameters);
        });

    coherentStateButton
        .on("click", function() {
            plot_parameters.std_X1 = coherentUncertainty;
            plot_parameters.std_X2 = coherentUncertainty;
            x1Slider.value(coherentUncertainty);
            x2Slider.value(coherentUncertainty);
            update(plot_parameters);
        });

    thermalStateButton
        .on("click", function() {
            plot_parameters.std_X1 = coherentUncertainty*2;
            plot_parameters.std_X2 = coherentUncertainty*2;
            x1Slider.value(coherentUncertainty*2);
            x2Slider.value(coherentUncertainty*2);
            update(plot_parameters);
        });

    vacuumSqueezedButton
        .on("click", function() {
            var amplitude = 0;
            plot_parameters.amplitude = amplitude;
            amplitudeSlider.value(amplitude);
            plot_parameters.std_X1 = coherentUncertainty*2.5;
            plot_parameters.std_X2 = coherentUncertainty/2.5;
            x1Slider.value(coherentUncertainty*2.5);
            x2Slider.value(coherentUncertainty/2.5);
            update(plot_parameters);
        });

    phaseSqueezedButton
        .on("click", function() {
            plot_parameters.std_X1 = coherentUncertainty*2.5;
            plot_parameters.std_X2 = coherentUncertainty/2.5;
            x1Slider.value(coherentUncertainty*2.5);
            x2Slider.value(coherentUncertainty/2.5);
            plot_parameters.sqz_angle = plot_parameters.phase;
            sqzAngleSlider.value(plot_parameters.phase);
            update(plot_parameters);
        });

    amplitudeSqueezedButton
        .on("click", function() {
            plot_parameters.std_X1 = coherentUncertainty/2.5;
            plot_parameters.std_X2 = coherentUncertainty*2.5;
            x1Slider.value(coherentUncertainty/2.5);
            x2Slider.value(coherentUncertainty*2.5);
            plot_parameters.sqz_angle = plot_parameters.phase;
            sqzAngleSlider.value(plot_parameters.phase);
            update(plot_parameters);
        });

    function step() {
        currentValue = currentValue + targetValue/64;
        plot_parameters.time = currentValue;
        update(plot_parameters);
        update_det_angle(plot_parameters.det_angle, plot_parameters.time * plot_parameters.frequency + plot_parameters.det_angle);
        if (currentValue + 1/64 > targetValue) {
            moving = false;
            currentValue = 0;
            clearInterval(timer);
            // timer = 0;
            playButton.text("Play");
            console.log("Slider moving: " + moving);
        }
    }

    //-------Sliders----------------------------------------------------------
    const slider_width = 200;
    const div_slider_height = 62;
    const div_slider_width = slider_width + 70;

    const amplitudeSlider = d3.sliderHorizontal()
        .min(0)
        .max(1)
        .width(slider_width)
        .tickValues([0, 0.2, 0.4, 0.6, 0.8, 1])
        .tickFormat(function(d){
            if (d <= 0.001) {return "0";}
            else if ((100*d) % 10 < 0.1) {return d3.format("2.1f")(d);}
            else {return d3.format("2.2f")(d);}
        })
        .displayValue(true)
        .default(plot_parameters.amplitude)
        .on("onchange", (val) => {
            plot_parameters.amplitude = val;
            update(plot_parameters);
        });
    var g = d3.select("div#js-amplitude-slider").append("svg")
        .attr("width", div_slider_width)
        .attr("height", div_slider_height)
        .append("g")
        .attr("transform", "translate(30,15)");
    g.call(amplitudeSlider);

    const phaseSlider = d3.sliderHorizontal()
        .min(0)
        .max(2*Math.PI)
        .width(slider_width)
        .tickValues([0, 0.5*Math.PI, Math.PI, 1.5*Math.PI, 2*Math.PI])
        .tickFormat(function(d){
            if (d <= 0.001) {return "0";}
            else if (d > 1.5705 && d < 1.571) {return "";}
            else if (d > 3.1415 && d < 3.1416) {return "\u03C0";}
            else if (d > 4.7123 && d < 4.7124) {return "";}
            else if (d > 6.283) {return "2\u03C0";}
            else {return d3.format("2.2f")(d);}
        })
        .displayValue(true)
        .default(plot_parameters.phase)
        .on("onchange", (val) => {
            plot_parameters.phase = val;
            update(plot_parameters);
        });
    g = d3.select("div#js-phase-slider").append("svg")
        .attr("width", div_slider_width)
        .attr("height", div_slider_height)
        .append("g")
        .attr("transform", "translate(30,15)");
    g.call(phaseSlider);

    const sqzAngleSlider = d3.sliderHorizontal()
        .min(0)
        .max(2*Math.PI)
        .width(slider_width)
        .tickValues([0, 0.5*Math.PI, Math.PI, 1.5*Math.PI, 2*Math.PI])
        .tickFormat(function(d){
            if (d <= 0.001) {return "0";}
            else if (d > 1.5705 && d < 1.571) {return "";}
            else if (d > 3.1415 && d < 3.1416) {return "\u03C0";}
            else if (d > 4.7123 && d < 4.7124) {return "";}
            else if (d > 6.283) {return "2\u03C0";}
            else {return d3.format("2.2f")(d);}
        })
        .displayValue(true)
        .default(plot_parameters.sqz_angle)
        .on("onchange", (val) => {
            plot_parameters.sqz_angle = val;
            update(plot_parameters);
        });
    g = d3.select("div#js-sqzAngle-slider").append("svg")
        .attr("width", div_slider_width)
        .attr("height", div_slider_height)
        .append("g")
        .attr("transform", "translate(30,15)");
    g.call(sqzAngleSlider);

    const detectionAngleSlider = d3.sliderHorizontal()
        .min(0)
        .max(2*Math.PI)
        .width(slider_width)
        .tickValues([0, 0.5*Math.PI, Math.PI, 1.5*Math.PI, 2*Math.PI])
        .tickFormat(function(d){
            if (d <= 0.001) {return "0";}
            else if (d > 1.5705 && d < 1.571) {return "";}
            else if (d > 3.1415 && d < 3.1416) {return "\u03C0";}
            else if (d > 4.7123 && d < 4.7124) {return "";}
            else if (d > 6.283) {return "2\u03C0";}
            else {return d3.format("2.2f")(d);}
        })
        .displayValue(true)
        .default(plot_parameters.det_angle)
        .on("onchange", (val) => {
            plot_parameters.det_angle = val;
            update_det_angle(val, val + plot_parameters.time * plot_parameters.frequency);
        });
    g = d3.select("div#js-detectionAngle-slider").append("svg")
        .attr("width", div_slider_width)
        .attr("height", div_slider_height)
        .append("g")
        .attr("transform", "translate(30,15)");
    g.call(detectionAngleSlider);


    const x1Slider = d3.sliderHorizontal()
        .min(0.01)
        .max(1)
        .width(slider_width)
        .tickValues([0, 0.2, 0.4, 0.6, 0.8, 1])
        .tickFormat(function(d){
            if (d <= 0.0101) {return "0";}
            else if ((100*d) % 10 < 0.1) {return d3.format("2.1f")(d);}
            else {return d3.format("2.2f")(d);}
        })
        .default(plot_parameters.std_X1)
        .on("onchange", (val) => {
            plot_parameters.std_X1 = val;
            update(plot_parameters);
        });
    g = d3.select("div#js-x1-slider").append("svg")
        .attr("width", div_slider_width)
        .attr("height", div_slider_height)
        .append("g")
        .attr("transform", "translate(30,15)");
    g.call(x1Slider);

    const x2Slider = d3.sliderHorizontal()
        .min(0.01)
        .max(1)
        .width(slider_width)
        .tickValues([0.01, 0.2, 0.4, 0.6, 0.8, 1])
        .tickFormat(function(d){
            if (d <= 0.0101) {return "0";}
            else if ((100*d) % 10 < 1) {return d3.format("2.1f")(d);}
            else {return d3.format("2.2f")(d);}
        })
        .default(plot_parameters.std_X2)
        .on("onchange", (val) => {
            plot_parameters.std_X2 = val;
            update(plot_parameters);
        });
    g = d3.select("div#js-x2-slider").append("svg")
        .attr("width", div_slider_width)
        .attr("height", div_slider_height)
        .append("g")
        .attr("transform", "translate(30,15)");
    g.call(x2Slider);

    //-------Plot-------------------------------------------------------------
    const basiclength = 240;
    const margin = {top: 50, right: 30, bottom: 30, left: 30, horcenter: 60, vertcenter: 60};
    const totalwidth = 2*basiclength + margin.left + margin.right + margin.horcenter;
    const totalheight = 1.5*basiclength + margin.top + margin.bottom + margin.vertcenter;

    const svg = d3.select("body").select("div#js-plot")
        .append("svg")
            .attr("width", totalwidth)
            .attr("height", totalheight)
            .style("border", "1px solid black");
    const nonRotatingPhaseSpace = svg.append("g")
            .attr("class", "nonRotatingPhaseSpace")
            .attr("transform",
                  "translate(" + (margin.left+basiclength/2) + "," + (margin.top+basiclength/2) + ")");
    const rotatingPhaseSpace = svg.append("g")
            .attr("class", "rotatingPhaseSpace")
            .attr("transform",
                  "translate(" + (margin.left+margin.horcenter+1.5*basiclength) + "," + (margin.top+basiclength/2) + ")");
    const nonRotatingTimeSeries = svg.append("g")
            .attr("class", "nonRotatingTime")
            .attr("transform",
                  "translate(" + (margin.left+basiclength/2) + "," + (margin.top+margin.vertcenter+1.25*basiclength) + ")");
    const rotatingTimeSeries = svg.append("g")
            .attr("class", "rotatingTime")
            .attr("transform",
                  "translate(" + (margin.left+margin.horcenter+1.5*basiclength) + "," + (margin.top+margin.vertcenter+1.25*basiclength) + ")");

    svg.append("text")
        .text("created by D. Steinmeyer")
        .attr("x", totalwidth-120)
        .attr("y", totalheight-5)
        .attr("font-size", "9px")
        .attr("fill", "gray")
        .attr("opacity", 0.5);

    var x = d3.scaleLinear().range([-basiclength/2, basiclength/2]);
    var y = d3.scaleLinear().range([basiclength/2, -basiclength/2]);

    var x2 = d3.scaleLinear().range([-basiclength/2, basiclength/2]);
    var y2 = d3.scaleLinear().range([basiclength/4, -basiclength/4]);

    x.domain([-1.3,1.3]);
    y.domain([-1.3, 1.3]);

    x2.domain([-0.1*Math.PI, 4.1*Math.PI]);
    y2.domain([-1.3, 1.3]);

    nonRotatingPhaseSpace.append("line")
        .attr("class", "coord-axis")
        .attr("x1", -basiclength/2)
        .attr("x2", basiclength/2)
        .attr("y1", 0)
        .attr("y2", 0);
    nonRotatingPhaseSpace.append("line")
        .attr("class", "coord-axis")
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("y1", -basiclength/2)
        .attr("y2", basiclength/2);

    rotatingPhaseSpace.append("line")
        .attr("class", "coord-axis")
        .attr("x1", -basiclength/2)
        .attr("x2", basiclength/2)
        .attr("y1", 0)
        .attr("y2", 0);
    rotatingPhaseSpace.append("line")
        .attr("class", "coord-axis")
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("y1", -basiclength/2)
        .attr("y2", basiclength/2);

    nonRotatingTimeSeries.append("line")
        .attr("class", "coord-axis")
        .attr("x1", -basiclength/2)
        .attr("x2", basiclength/2)
        .attr("y1", 0)
        .attr("y2", 0);
    nonRotatingTimeSeries.append("line")
        .attr("class", "coord-axis")
        .attr("x1", x2(0))
        .attr("x2", x2(0))
        .attr("y1", -basiclength/4)
        .attr("y2", basiclength/4);

    rotatingTimeSeries.append("line")
        .attr("class", "coord-axis")
        .attr("x1", -basiclength/2)
        .attr("x2", basiclength/2)
        .attr("y1", 0)
        .attr("y2", 0);
    rotatingTimeSeries.append("g").attr("class","axisX1")
        .append("line")
        .attr("class", "coord-axis")
        .attr("x1", x2(0))
        .attr("x2", x2(0))
        .attr("y1", -basiclength/4)
        .attr("y2", basiclength/4);
    rotatingTimeSeries.append("g").attr("class","axisX2")
        .append("line")
        .attr("class", "coord-axis")
        .attr("x1", x2(Math.PI/2))
        .attr("x2", x2(Math.PI/2))
        .attr("y1", -basiclength/4)
        .attr("y2", basiclength/4);


    var det_axes = rotatingPhaseSpace.append("g").attr("class", "detaxis_rotPhaseSpace");
    det_axes.append("line")
        .attr("class", "det-axis")
        .attr("x1", -basiclength/20)
        .attr("x2", 19*basiclength/40)
        .attr("y1", 0)
        .attr("y2", 0);
    det_axes.append("line")
        .attr("class", "det-axis")
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("y1", basiclength/20)
        .attr("y2", -19*basiclength/40);
    det_axes = nonRotatingPhaseSpace.append("g").attr("class", "detaxis_nonRotPhaseSpace");
    det_axes.append("line")
        .attr("class", "det-axis")
        .attr("x1", -basiclength/20)
        .attr("x2", 19*basiclength/40)
        .attr("y1", 0)
        .attr("y2", 0);
    det_axes.append("line")
        .attr("class", "det-axis")
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("y1", basiclength/20)
        .attr("y2", -19*basiclength/40);

    rotatingPhaseSpace.append("ellipse")
        .attr("class", "error-ellipse");

    nonRotatingPhaseSpace.append("ellipse")
        .attr("class", "error-ellipse");

    var data = get_distribution(plot_parameters);
    rotatingPhaseSpace.append("g")
            .attr("class", "data-points")
            .selectAll("circle")
            .data(data)
            .enter()
            .selectAll("circle")
            .data(function(d, i){
                return [d];
            })
            .enter()
            .append("circle")
            .attr("class", "data-point")
            .attr("r", 1);
    rotatingPhaseSpace.append("line")
        .attr("class","complex-amplitude")
        .attr("x1", 0)
        .attr("y1", 0);
    rotatingPhaseSpace.append("g")
        .attr("class","X1")
        .append("line")
        .attr("class","quadrature")
        .attr("x1", 0)
        .attr("y1", 0);
    rotatingPhaseSpace.append("g")
        .attr("class","X2")
        .append("line")
        .attr("class","quadrature")
        .attr("x1", 0)
        .attr("y1", 0);
    nonRotatingPhaseSpace.append("g")
            .attr("class", "data-points")
            .selectAll("circle")
            .data(data)
            .enter()
            .selectAll("circle")
            .data(function(d, i){
                return [d];
            })
            .enter()
            .append("circle")
            .attr("class", "data-point")
            .attr("r", 1.3);
    nonRotatingPhaseSpace.append("line")
        .attr("class","complex-amplitude")
        .attr("x1", 0)
        .attr("y1", 0);
    nonRotatingPhaseSpace.append("line")
        .attr("class","electric-field")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("y2", 0);
    rotatingTimeSeries.append("path").attr("class","time-series");
    rotatingTimeSeries.append("path").attr("class","envelope-max");
    rotatingTimeSeries.append("path").attr("class","envelope-min");
    rotatingTimeSeries.append("g").attr("class","X1")
        .append("line")
        .attr("class", "quadrature")
        .attr("x1", x2(0))
        .attr("x2", x2(0))
        .attr("y1", 0);
    rotatingTimeSeries.select("g.X1").append("circle")
        .attr("class", "quadrature")
        .attr("cx", x2(0))
        .attr("r", 2);
    rotatingTimeSeries.append("g").attr("class","X2")
        .append("line")
        .attr("class", "quadrature")
        .attr("x1", x2(Math.PI/2))
        .attr("x2", x2(Math.PI/2))
        .attr("y1", 0);
    rotatingTimeSeries.select("g.X2").append("circle")
        .attr("class", "quadrature")
        .attr("cx", x2(Math.PI/2))
        .attr("r", 2);
    nonRotatingTimeSeries.append("path").attr("class","envelope-max");
    nonRotatingTimeSeries.append("path").attr("class","envelope-min");
    nonRotatingTimeSeries.append("path").attr("class","time-series");
    nonRotatingTimeSeries.append("g").attr("class","eField")
        .append("line")
        .attr("class", "electric-field")
        .attr("x1", x2(0))
        .attr("x2", x2(0))
        .attr("y1", 0);
    nonRotatingTimeSeries.select("g.eField")
        .append("circle")
        .attr("class", "electric-field")
        .attr("cx", x2(0))
        .attr("r", 2);

    update(plot_parameters);
    changeDataPointsOpacity();


    function update_det_angle(angle, timeangle) {
    var selection;
    var enter;
        selection = d3.select("g.detaxis_rotPhaseSpace")
            .datum(angle);
        enter = selection.enter();
        selection.merge(enter)
            .attr("transform", "rotate(" + (-180*angle/Math.PI) + ")");
        selection = d3.select("g.detaxis_nonRotPhaseSpace")
            .datum(timeangle);
        enter = selection.enter();
        selection.merge(enter)
            .attr("transform", "rotate(" + (-180*timeangle/Math.PI) + ")");

        var xvalue = plot_parameters.point[0];
        var yvalue = plot_parameters.point[1];
        var phase = Math.atan2(yvalue, xvalue);
        var magnitude = Math.sqrt(Math.pow(xvalue,2) + Math.pow(yvalue,2));
        selection = d3.select("g.rotatingPhaseSpace").select("g.X1").select("line");
        enter = selection.enter();
        selection.merge(enter)
            .attr("x2", x(Math.cos(angle-phase)*magnitude*Math.cos(angle)))
            .attr("y2", y(Math.cos(angle-phase)*magnitude*Math.sin(angle)));
        selection = d3.select("g.rotatingPhaseSpace").select("g.X2").select("line");
        enter = selection.enter();
        selection.merge(enter)
            .attr("x2", x(Math.sin(angle-phase)*magnitude*Math.sin(angle)))
            .attr("y2", y(-Math.sin(angle-phase)*magnitude*Math.cos(angle)));
        selection = d3.select("g.rotatingTime").select("g.axisX1").select("line");
        enter = selection.enter();
        selection.merge(enter)
            .attr("x1", x2(angle))
            .attr("x2", x2(angle));
        selection = d3.select("g.rotatingTime").select("g.axisX2").select("line");
        enter = selection.enter();
        selection.merge(enter)
            .attr("x1", x2(angle+Math.PI/2))
            .attr("x2", x2(angle+Math.PI/2));
        selection = d3.select("g.rotatingTime").select("g.X1").select("line");
        enter = selection.enter();
        selection.merge(enter)
            .attr("x1", x2(angle))
            .attr("x2", x2(angle))
            .attr("y2", y2(magnitude*Math.cos(angle-phase)));
        selection = d3.select("g.rotatingTime").select("g.X2").select("line");
        enter = selection.enter();
        selection.merge(enter)
            .attr("x1", x2(angle+Math.PI/2))
            .attr("x2", x2(angle+Math.PI/2))
            .attr("y2", y2(-magnitude*Math.sin(angle-phase)));
        selection = d3.select("g.rotatingTime").select("g.X1").select("circle");
        enter = selection.enter();
        selection.merge(enter)
            .attr("cx", x2(angle))
            .attr("cy", y2(magnitude*Math.cos(angle-phase)));
        selection = d3.select("g.rotatingTime").select("g.X2").select("circle");
        enter = selection.enter();
        selection.merge(enter)
            .attr("cx", x2(angle+Math.PI/2))
            .attr("cy", y2(-magnitude*Math.sin(angle-phase)));
    }

    function update(plot_parameters) {
        var angle = plot_parameters.sqz_angle;
        var phase = plot_parameters.phase;
        var time = plot_parameters.time*plot_parameters.frequency;
        var timephase = plot_parameters.phase + time;
        var amplitude = plot_parameters.amplitude;
        var X1 = plot_parameters.std_X1;
        var X2 = plot_parameters.std_X2;
        var det_angle = plot_parameters.det_angle;

        var data = get_distribution(plot_parameters);
        var point = data[0];
        var timedata = get_timeSeries(plot_parameters);
        var phasedata = get_timeSeries(plot_parameters, 0);
        var timeEnvelope = get_envelope_data(plot_parameters);
        var phaseEnvelope = get_envelope_data(plot_parameters, 0);


        plot_parameters.point = point;
        var complexphase = Math.atan2(point[1], point[0]);
        var magnitude = Math.sqrt(Math.pow(point[0],2) + Math.pow(point[1],2));

        var selection = d3.select("g.rotatingPhaseSpace").select("g.data-points")
            .selectAll("circle")
            .data(data);
        var enter = selection.enter();
        selection.merge(enter).attr("cx", function(d) {return x(d[0]);})
            .attr("cy", function(d) {return y(d[1]);});

        selection = d3.select("g.nonRotatingPhaseSpace").select("g.data-points")
            .selectAll("circle")
            .data(data);
        enter = selection.enter();
        selection.merge(enter).attr("cx", function(d) {return x(d[0]);})
            .attr("cy", function(d) {return y(d[1]);});

        selection = d3.select("g.nonRotatingPhaseSpace").select("g.data-points");
        enter = selection.enter();
        selection.merge(enter).attr("transform", "rotate(" + (-180*time/Math.PI) + ")");

        selection = d3.select("g.rotatingPhaseSpace").select("ellipse.error-ellipse");
        enter = selection.enter();
        selection.merge(enter)
            .attr("transform", "translate(" + x(amplitude*Math.cos(phase)) + "," + y(amplitude*Math.sin(phase)) + ")rotate(" + (-180*angle/Math.PI) + ")")
            .attr("rx",x(X1)/2)
            .attr("ry",x(X2)/2);
        selection = d3.select("g.nonRotatingPhaseSpace").select("ellipse.error-ellipse");
        enter = selection.enter();
        selection.merge(enter)
           .attr("transform", "translate(" + x(amplitude*Math.cos(timephase)) + "," + y(amplitude*Math.sin(timephase)) + ")rotate(" + (-180*(time+angle)/Math.PI) + ")")
            .attr("rx",x(X1)/2)
            .attr("ry",x(X2)/2);

        selection = d3.select("g.nonRotatingPhaseSpace").select("line.electric-field");
        enter = selection.enter();
        selection.merge(enter).attr("x2", Math.cos(time)*x(point[0])- Math.sin(time)*x(point[1]));
        selection = d3.select("g.nonRotatingPhaseSpace").select("line.complex-amplitude");
        enter = selection.enter();
        selection.merge(enter)
            .attr("x2", x(Math.cos(time)*point[0]) - Math.sin(time)*x(point[1]))
            .attr("y2", y(Math.cos(time)*point[1]) + y(Math.sin(time)*point[0]));

        selection = d3.select("g.rotatingPhaseSpace").select("g.X1").select("line");
        enter = selection.enter();
        selection.merge(enter)
            .attr("x2", Math.cos(det_angle)*x(point[0]))
            .attr("y2", -Math.sin(det_angle)*x(point[0]));
        selection = d3.select("g.rotatingPhaseSpace").select("g.X2").select("line");
        enter = selection.enter();
        selection.merge(enter)
            .attr("x2", Math.sin(det_angle)*y(point[1]))
            .attr("y2", Math.cos(det_angle)*y(point[1]));
        selection = d3.select("g.rotatingPhaseSpace").select("line.complex-amplitude");
        enter = selection.enter();
        selection.merge(enter)
            .attr("x2", x(point[0]))
            .attr("y2", y(point[1]));

        selection = d3.select("g.rotatingTime").select("g.X1").select("line");
        enter = selection.enter();
        selection.merge(enter)
            .attr("y2", y2(magnitude*Math.cos(det_angle-complexphase)));
        selection = d3.select("g.rotatingTime").select("g.X2").select("line");
        enter = selection.enter();
        selection.merge(enter)
            .attr("y2", y2(-magnitude*Math.sin(det_angle-complexphase)));
        selection = d3.select("g.rotatingTime").select("g.X1").select("circle");
        enter = selection.enter();
        selection.merge(enter)
            .attr("cy", y2(magnitude*Math.cos(det_angle-complexphase)));
        selection = d3.select("g.rotatingTime").select("g.X2").select("circle");
        enter = selection.enter();
        selection.merge(enter)
            .attr("cy", y2(-magnitude*Math.sin(det_angle-complexphase)));
        selection = d3.select("g.nonRotatingTime").select("line.electric-field");
        enter = selection.enter();
        selection.merge(enter)
            .attr("y2", y2(Math.cos(time)*point[0]- Math.sin(time)*point[1]));
        selection = d3.select("g.nonRotatingTime").select("circle.electric-field");
        enter = selection.enter();
        selection.merge(enter)
            .attr("cy", y2(Math.cos(time)*point[0]- Math.sin(time)*point[1]));

        var line = d3.line()
            .x(function(d) { return x2(d[0]); })
            .y(function(d) { return y2(d[1]); });
        var line2 = d3.line()
            .x(function(d) { return x2(d[0]); })
            .y(function(d) { return y2(d[2]); });
        selection = d3.select("g.nonRotatingTime")
            .select("path.time-series")
            .datum(timedata);
        enter = selection.enter();
        selection.merge(enter)
            .attr("d", line(timedata));
        selection = d3.select("g.rotatingTime")
            .select("path.time-series")
            .datum(phasedata);
        enter = selection.enter();
        selection.merge(enter)
            .attr("d", line(phasedata));

        selection = d3.select("g.nonRotatingTime")
            .select("path.envelope-max")
            .datum(timeEnvelope);
        enter = selection.enter();
        selection.merge(enter)
            .attr("d", line(timeEnvelope));
        selection = d3.select("g.rotatingTime")
            .select("path.envelope-max")
            .datum(phaseEnvelope);
        enter = selection.enter();
        selection.merge(enter)
            .attr("d", line(phaseEnvelope));
        selection = d3.select("g.nonRotatingTime")
            .select("path.envelope-min")
            .datum(timeEnvelope);
        enter = selection.enter();
        selection.merge(enter)
            .attr("d", line2(timeEnvelope));
        selection = d3.select("g.rotatingTime")
            .select("path.envelope-min")
            .datum(phaseEnvelope);
        enter = selection.enter();
        selection.merge(enter)
            .attr("d", line2(phaseEnvelope));
    }

    function changeDataPointsOpacity() {
        var opacityDataPoints;
        var opacityDataStrokes;
        var opacityUncertainty;
        if(toggleDataPoints % 3 != 0) {
            opacityDataPoints = 0.5;
	    opacityDataStrokes = 1.0;
        } else {
            opacityDataPoints = 0.0;
	    opacityDataStrokes = 0.0;
	}
        if(toggleDataPoints % 3 != 2) {
	    opacityUncertainty = 1.0;
        } else {
	    opacityUncertainty = 0.0;
        }
        var selection = d3.selectAll("circle");
        var enter = selection.enter();
        selection.merge(enter).attr("fill-opacity", opacityDataPoints);

        selection = d3.selectAll("path.time-series");
        enter = selection.enter();
        selection.merge(enter).attr("stroke-opacity", opacityDataStrokes);

	selection = d3.selectAll("path.envelope-max")
        enter = selection.enter();
        selection.merge(enter).attr("stroke-opacity", opacityUncertainty);

	selection = d3.selectAll("path.envelope-min")
        enter = selection.enter();
        selection.merge(enter).attr("stroke-opacity", opacityUncertainty);

	selection = d3.selectAll("ellipse")
        enter = selection.enter();
        selection.merge(enter).attr("stroke-opacity", opacityUncertainty);
    }
