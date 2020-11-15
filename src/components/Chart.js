import React, { useRef, useEffect, useState } from 'react';
import './Chart.css';
import * as d3 from 'd3';
import data from '../data/volumes.json';

const Chart = ({ value, price, setTotal }) => {
    const [width, setWidth] = useState(500);
    const svgRef = useRef(null);

    useEffect(() => {
        const volumes = data.map(elem => (Number(elem.AMOUNT_IN_ETH) + Number(elem.AMOUNT_OUT_ETH)) / Math.pow(10, 18));
        const TOTAL_VOLUME = volumes.reduce((acc, cur) => acc + cur, 0);
        const DATA = [];

        data.forEach(elem => {
            const volume = (Number(elem.AMOUNT_IN_ETH) + Number(elem.AMOUNT_OUT_ETH)) / Math.pow(10, 18)
            DATA.push({
                ...elem,
                VOLUME_ETH: volume,
                VOLUME_USD: volume * price,
                percent: volume / TOTAL_VOLUME
            });
        });

        const outerWidth = width;
        const outerHeight = 360;
        const margin = {
            top: 20,
            left: 50,
            bottom: 50,
            right: 20
        };
        const innerWidth = outerWidth - margin.left - margin.right;
        const innerHeight = outerHeight - margin.top - margin.bottom;
        const paddingInner = 0.1;
        const duration = 1000;
        const million = 1000000;
        const billion = 1000000000;

        d3.selectAll('*').interrupt();

        const xScale = d3.scaleBand()
            .range([0, innerWidth])
            .domain(DATA.map(d => d.PAIR))
            .paddingInner(paddingInner);

        const yScale = d3.scaleLinear()
            .range([innerHeight, 0])
            .nice();

        if(value === 'percent') {
            yScale.domain([0, 100]);
            setTotal('Total');
        } else if(value === 'eth') {
            yScale.domain([0, 10]);
            setTotal(`${DATA.reduce((acc, cur) => acc + cur.VOLUME_ETH / million, 0).toFixed(1)}M`);
        } else {
            yScale.domain([0, 10]);
            setTotal(`${DATA.reduce((acc, cur) => acc + cur.VOLUME_USD / billion, 0).toFixed(1)}B`);
        }

        const svg = d3.select(svgRef.current)
            .data([null])
            .join('svg')
                .classed('chart', true)
                .attr('width', outerWidth)
                .attr('height', outerHeight)
        .selectAll('g')
            .data([null])
            .join('g')
                .classed('group', true)
                .attr('transform', `translate(${margin.left},${margin.top})`);

        svg.selectAll('.bar_back')
            .data(DATA)
            .join('rect')
                .classed('bar_back', true)
                .attr('x', d => xScale(d.PAIR) + 10)
                .attr('rx', 2.5)
                .attr('width', (d, i) => 44)
                .attr('y', innerHeight)
                .attr('height', 0)
            .transition()
                .duration(duration)
                .ease(d3.easePolyOut)
                .attr('y', d => {
                    if(value === 'percent') {
                        return yScale(d.VOLUME_ETH / TOTAL_VOLUME * 100);
                    } else if(value === 'eth') {
                        return yScale(d.VOLUME_ETH / million);
                    } else {
                        return yScale(d.VOLUME_USD / billion);
                    }
                })
                .attr('height', d => {
                    if(value === 'percent') {
                        return innerHeight - yScale(d.VOLUME_ETH / TOTAL_VOLUME * 100);
                    } else if(value === 'eth') {
                        return innerHeight - yScale(d.VOLUME_ETH / million);
                    } else {
                        return innerHeight - yScale(d.VOLUME_USD / billion);
                    }
                });

        svg.selectAll('.bar_front')
            .data(DATA)
            .join('rect')
                .classed('bar_front', true)
                .attr('x', d => xScale(d.PAIR) + 15)
                .attr('rx', 2.5)
                .attr('width', 44)
                .attr('y', innerHeight)
                .attr('height', 0)
            .transition()
                .duration(duration)
                .ease(d3.easePolyOut)
                .attr('y', d => {
                    if(value === 'percent') {
                        return yScale(d.VOLUME_ETH / TOTAL_VOLUME * 100);
                    } else if(value === 'eth') {
                        return yScale(d.VOLUME_ETH / million);
                    } else {
                        return yScale(d.VOLUME_USD / billion);
                    }
                })
                .attr('height', d => {
                    if(value === 'percent') {
                        return innerHeight - yScale(d.VOLUME_ETH / TOTAL_VOLUME * 100);
                    } else if(value === 'eth') {
                        return innerHeight - yScale(d.VOLUME_ETH / million);
                    } else {
                        return innerHeight - yScale(d.VOLUME_USD / billion);
                    }
                });

        svg.selectAll('.bar_label')
            .data(DATA)
            .join('text')
                .classed('bar_label', true)
                .text(d => {
                    if(value === 'percent') {
                        return `${parseFloat(d.VOLUME_ETH / TOTAL_VOLUME * 100).toFixed(1)}%`;
                    } else if(value === 'eth') {
                        return `${parseFloat(d.VOLUME_ETH / 1000000).toFixed(1)}M`;
                    } else {
                        return `${parseFloat(d.VOLUME_USD / 1000000000).toFixed(1)}B`;
                    }
                })
                .attr('x', d => xScale(d.PAIR) + 30)
                .attr('rx', 2.5)
                .attr('width', (d, i) => 44)
                .attr('y', (d, i) => {
                    if(value === 'percent') {
                        return yScale(d.VOLUME_ETH / TOTAL_VOLUME * 100) - 8;
                    } else if(value === 'eth') {
                        return yScale(d.VOLUME_ETH / million) - 8;
                    } else {
                        return yScale(d.VOLUME_USD / billion) - 8;
                    }
                })
                .style('opacity', 0)
                .transition()
                .delay(duration)
                .duration(0)
                .ease(d3.easePolyOut)
                .style('opacity', 1);

        const xAxis = d3.axisBottom(xScale);
        const xAxisValues = svg.selectAll('.xAxis-values')
            .data([null])
            .join('g')
                .classed('xAxis-values', true)
                .attr('transform', `translate(0, ${innerHeight})`)
                .call(xAxis);

        const xAxisLabel = svg.selectAll('.xAxis-label')
            .data([null])
            .join('text')
                .classed('xAxis-label', true)
                .attr('transform', `translate(${innerWidth / 2},${innerHeight + margin.bottom / 2 + 15})`)
                .text('traded pairs');

        const yAxis = d3.axisLeft(yScale)
            .ticks(5)
            .tickFormat(d => {
                if(value === 'percent') {
                    return `${d}%`;
                } else {
                    return d;
                }
            });
    
        const yAxisValues = svg.selectAll('.yAxis-values')
            .data([null])
            .join('g')
                .classed('yAxis-values', true)
                .call(yAxis);
    
        const yAxisLabel = svg.selectAll('.yAxis-label')
            .data([null])
            .join('text')
                .classed('yAxis-label', true)
                .attr('transform', 'rotate(-90)')
                .attr('y', 0 - margin.right - 20)
                .attr('x', 0 - (innerHeight / 2))
                .text(d => {
                    if(value === 'percent') {
                        return '% in total volume';
                    } else if(value === 'eth') {
                        return `volume traded in ${value.toUpperCase()} (millions)`;
                    } else {
                        return `volume traded in ${value.toUpperCase()} (billions)`;
                    }
                });
    }, [value, price, setTotal, width]);

    useEffect(() => {
        window.addEventListener('resize', handleDisplay);

        return () => {
            window.removeEventListener('resize', handleDisplay);
        }
    });

    const handleDisplay = () => {
        if(window.innerWidth < 600) {
            setWidth(window.innerWidth - 110);
        } else {
            setWidth(500);
        }    
    }

    return (
        <div className="canvas">
            <svg ref={svgRef}></svg>
        </div>
    );
}

export default Chart;
