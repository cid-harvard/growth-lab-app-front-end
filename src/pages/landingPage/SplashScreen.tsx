import React, {useRef, useEffect} from 'react';
import styled from 'styled-components/macro';
import LogoIMG from './logo.png';
import BackgroundIMG from './image.jpg';

const Blur = styled.div`
  width: 100%;
  height: 100vh;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  background-image: url(${BackgroundIMG});
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  filter: blur(3px);
`;
const Title = styled.div`
  position: absolute;
  z-index: 2;
  text-align: left;
  margin: 18% 0 0 6vw;
  left:0;
  right: 0;
  font-family: 'Open Sans Condensed', sans-serif;
  text-shadow: 1px 1px 10px black;
  color: white;
  text-transform: uppercase;
`;
const H1 = styled.h1`
  font-size: 40px;
  font-weight: 200;
  letter-spacing: 2px;
`;
const H4 = styled.h4`
  font-size: 15px;
  font-weight: 200;
  letter-spacing: 4px;
  margin-top: 1rem;

  &::before {
    content: "";
    height: 1px;
    width: 50px;
    background-color: white;
    display: inline-block;
    margin-bottom: 5px;
    margin-right: 10px;
  }

  &::after {
    content: "";
    height: 1px;
    width: 60px;
    background-color: white;
    display: inline-block;
    margin-bottom: 5px;
    margin-left: 10px;
  }
`;
const Logo = styled.img`
  position: absolute;
  bottom: 1rem;
  z-index: 3;
  height: 110px;
  margin: auto;
  left: 0;
  right: 0;
`;
const Container = styled.div`
  position: absolute;
  z-index:9999;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;

export default () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (containerRef && containerRef.current && canvasRef && canvasRef.current) {
      const canvasNode = canvasRef.current;
      const containerNode = containerRef.current;
      const WIDTH = window.innerWidth;
      const HEIGHT = window.innerHeight;
      const pixels: any[] = [];
      const rint = 60;

      containerNode.style.width = WIDTH + 'px';
      containerNode.style.height = HEIGHT + 'px';

      canvasNode.setAttribute('width', WIDTH.toString());
      canvasNode.setAttribute('height', HEIGHT.toString());

      const context = canvasNode.getContext('2d');

      class Circle {
        s: any;
        x: any;
        y: any;
        dx: any;
        dy: any;
        r: any;
        hl: any;
        rt: any;
        stop: any;
        constructor() {
          this.s = {
            ttl:8000,
            xmax:5, ymax:2,
            rmax:10, rt:1,
            xdef:960, ydef:540,
            xdrift:4, ydrift: 4,
            random:true, blink:true,
          };
        }
        reset() {
            this.x = (this.s.random ? WIDTH*Math.random() : this.s.xdef);
            this.y = (this.s.random ? HEIGHT*Math.random() : this.s.ydef);
            this.r = ((this.s.rmax-1)*Math.random()) + 1;
            this.dx = (Math.random()*this.s.xmax) * (Math.random() < .5 ? -1 : 1);
            this.dy = (Math.random()*this.s.ymax) * (Math.random() < .5 ? -1 : 1);
            this.hl = (this.s.ttl/rint)*(this.r/this.s.rmax);
            this.rt = Math.random()*this.hl;
            this.s.rt = Math.random()+1;
            this.stop = Math.random()*.2+.4;
            this.s.xdrift *= Math.random() * (Math.random() < .5 ? -1 : 1);
            this.s.ydrift *= Math.random() * (Math.random() < .5 ? -1 : 1);
        }
        fade() {
          this.rt += this.s.rt;
        }
        draw() {
            if (this.s.blink && (this.rt <= 0 || this.rt >= this.hl)) {
              this.s.rt = this.s.rt*-1;
            } else if (this.rt >= this.hl) {
              this.reset();
            }
            if (context) {
              context.beginPath();
              context.arc(this.x,this.y,this.r,0,Math.PI*2,true);
              context.closePath();
              const g = context.createRadialGradient(this.x,this.y,0,this.x,this.y,1);
              g.addColorStop(1.0, 'rgba(255,255,255,0.2)');
              context.fillStyle = g;
              context.fill();
            }
        }
        move() {
          this.x += (this.rt/this.hl)*this.dx;
          this.y += (this.rt/this.hl)*this.dy;
          if (this.x > WIDTH || this.x < 0) {
            this.dx *= -1;
          }
          if (this.y > HEIGHT || this.y < 0) {
            this.dy *= -1;
          }
        }
        getX() {
          return this.x;
        }
        getY() {
          return this.y;
        }
      }
      const draw = () => {
        if (context) {
          context.clearRect(0,0,WIDTH,HEIGHT);
          for(const pixel of pixels) {
            pixel.fade();
            pixel.move();
            pixel.draw();
          }
        }
      };
      for(let i = 0; i < 100; i++) {
        pixels[i] = new Circle();
        pixels[i].reset();
      }
      setInterval(draw, rint);
    }
  }, [containerRef, canvasRef]);

  return (
    <>
      <Blur />
      <Title>
        <H1>Harvard Growth Lab’s Digital Hub</H1>
        <H4>Translating Growth Lab’s research into effective online tools and digital platforms</H4>
      </Title>
      <a href='https://growthlab.cid.harvard.edu/' target='_blank' rel='noopener noreferrer'>
        <Logo src={LogoIMG} alt={'The Growth at Harvard Center for International Development'} />
      </a>
      <Container ref={containerRef}>
        <canvas ref={canvasRef} width='100%' height='100%' />
      </Container>
    </>
  );
};
