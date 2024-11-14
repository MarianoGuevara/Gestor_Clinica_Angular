import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ApexGrid,ApexLegend,ApexMarkers,ApexStroke,ApexTooltip,ChartComponent,} from 'ng-apexcharts';
import { ApexNonAxisChartSeries,ApexResponsive,ApexChart,} from 'ng-apexcharts';
import { ApexAxisChartSeries,ApexDataLabels,ApexXAxis,ApexPlotOptions} from 'ng-apexcharts';
import { ApexYAxis, ApexTitleSubtitle, ApexFill } from 'ng-apexcharts';

export type ChartOptions = {
    series: ApexNonAxisChartSeries;
    chart: ApexChart;
    responsive: ApexResponsive[];
    labels: any;
    plotOptions: ApexPlotOptions;
    dataLabels: ApexDataLabels;
};
export type BarChartOptions = {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    dataLabels: ApexDataLabels;
    plotOptions: ApexPlotOptions;
    yaxis: ApexYAxis;
    xaxis: ApexXAxis;
    fill: ApexFill;
    title: ApexTitleSubtitle;
    legend: ApexLegend;
};
export type LineChartOptions = {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    dataLabels: ApexDataLabels;
    plotOptions: ApexPlotOptions;
    yaxis: ApexYAxis;
    xaxis: ApexXAxis;
    fill: ApexFill;
    title: ApexTitleSubtitle;
    legend: ApexLegend;
    grid: ApexGrid;
};


@Component({
  selector: 'app-grafico-generico',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './grafico-generico.component.html',
  styleUrl: './grafico-generico.component.css'
})
export class GraficoGenericoComponent {
	@Input() tituloGrafico: string = '';
    @Input() tipoGrafico: string = '';
    @Input() labels: any;
    @Input() series: any;
	@Input() anchoGrafico: string = "300px";
	@Input() anchoContenedorGrafico: string = "300px";
    @ViewChild('barChart') barChart: ChartComponent | null = null;
    @ViewChild('pieChart') pieChart: ChartComponent | null = null;
    @ViewChild('lineChart') lineChart: ChartComponent | null = null;
    graficoBarras: Partial<BarChartOptions> | null = null;
    graficoPie: Partial<ChartOptions> | null = null;
    graficoLineas: Partial<LineChartOptions> | null = null;

	constructor() {}

    ngOnChanges() {
        // ngOnChanges es cuando cambia el input que le envia el padre
        if (this.tipoGrafico == 'lineas' && this.labels != null) {
            console.log('HOLAAA');
            console.log(this.labels);
            console.log(this.series);
            this.graficoLineas = this.generarGraficoLineas(parseInt(this.anchoGrafico));
            this.graficoLineas.series = this.series;
            this.graficoLineas.xaxis!.categories = this.labels;
            this.lineChart?.updateOptions({
                series: this.series,
                xaxis: { categories: this.labels },
            });
        } else if (this.tipoGrafico == 'pie' && this.labels != null) {
            this.graficoPie = this.generarGraficoPie('100%', this.anchoGrafico);
            this.graficoPie.series = this.series;
            this.graficoPie.labels = this.labels;
            this.pieChart?.updateOptions({
                series: this.series,
                labels: this.labels,
            });
        } else if (this.tipoGrafico == 'barras' && this.labels != null) {
            console.log(this.labels);
            console.log(this.series);
            this.graficoBarras = this.generarGraficoBarras('100%', parseInt(this.anchoGrafico));
            this.graficoBarras.series = this.series;
            this.graficoBarras.xaxis!.categories = this.labels;
            this.barChart?.updateOptions({
                series: this.graficoBarras.series,
                xaxis: this.graficoBarras.xaxis,
            });
            this.barChart?.updateOptions({
                series: this.graficoBarras.series,
                xaxis: { categories: this.labels },
            });
        }
    }

	// LABELS = ["a","b","c"]
	// SERIES = [{name:'', data:[1,2,3]}]
    generarGraficoLineas(height: number): Partial<LineChartOptions> {
        return {
            series: [
                {
                    name: 'Datos de Línea',
                    data: [], // Se actualizará más adelante
                },
            ],
            chart: {
                height: height,
                type: 'line',
                zoom: {
                    enabled: false,
                },
                toolbar: {
                    show: false, // Desactiva el menú de exportación
                },
            },
            dataLabels: {
                enabled: false,
            },
            xaxis: {
                categories: [], // Se actualizará con los labels
                labels: {
                    style: {
                        colors: '#000000', // Color blanco para las etiquetas de los ejes
                    },
                },
            },
            yaxis: {
                labels: {
                    style: {
                        colors: '#000000', // Color blanco para las etiquetas del eje Y
                    },
                },
            },
        };
    }

	// LABELS = ["a","b","c"]
	// SERIES = [1,2,3]
    generarGraficoPie(width: string, height: string): Partial<ChartOptions> {
        return {
            series: [],
            chart: {
                type: 'pie',
                width: width,
                height: height,
            },
            dataLabels: {
                style: {
                    fontSize: '18px',
                    colors: ['#fff'],
                },
            },
            labels: [],
            responsive: [
                {
                    breakpoint: 480,
                    options: {
                        chart: {
                            width: '100%',
                        },
                        legend: {
                            labels: {
                                colors: '#fff',
                            },
                            position: 'bottom',
                        },
                    },
                },
            ],
        };
    }

	// LABELS = ["a","b","c"]
	// SERIES = [{name:'', data:[1,2,3]}]
    generarGraficoBarras(
        width: string,
        height: number
    ): Partial<BarChartOptions> {
        return {
            series: [
                {
                    name: 'Likes por foto',
                    data: [], // Se actualizará más adelante
                },
            ],
            chart: {
                type: 'bar',
                width: width, // Ajuste a un tamaño dinámico
                height: height, // Más pequeño para ajustarse mejor a tu diseño
                toolbar: {
                    show: false, // Desactivamos la toolbar completamente
                },
            },
            plotOptions: {
                bar: {
                    horizontal: false, // Mantener el gráfico en vertical
                    dataLabels: {
                        position: 'top', // Mostrar etiquetas arriba de las barras
                    },
                },
            },
            dataLabels: {
                enabled: true,
                formatter: function (val: any) {
                    return val.toString(); // Solo mostrar el valor sin %
                },
                offsetY: -20,
                style: {
                    fontSize: '10px', // Hacemos más pequeña la etiqueta
                    colors: ['#000000'], // Cambiar color a blanco para mayor visibilidad
                },
            },
            xaxis: {
                categories: [], // Nombres de las fotos
                position: 'bottom',
                labels: {
                    offsetY: 0, // Ajusta la posición si es necesario
                    style: {
                        fontSize: '12px', // Ajusta el tamaño de la fuente
                        colors: '#000000', // Asegúrate de que sea blanco
                    },
                },
            },
            yaxis: {
                labels: {
                    formatter: function (val: any) {
                        return val.toString(); // Solo mostrar el valor sin %
                    },
                    style: {
                        fontSize: '10px', // Tamaño de texto más pequeño en el eje Y
                        colors: ['#000000'], // Cambiar el color a blanco
                    },
                },
            },
            fill: {
                colors: ['#008FFB'], // Cambiar el color de las barras a azul claro
            },
            title: {
                text: 'Número de Likes por Foto',
                align: 'center', // Centrar el título
                style: {
                    fontSize: '14px', // Tamaño de fuente más pequeño
                    color: '#fff', // Color blanco para el título
                },
            },
            legend: {
                labels: {
                    colors: '#fff', // Color blanco para la leyenda
                },
            },
        };
    }
}
