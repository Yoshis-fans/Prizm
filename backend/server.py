# Modified aiohttp_server.py example
# https://gist.github.com/Fufs/05cb9a37d4aec18a14637d4f3e184891

import asyncio
from aiohttp import web

import socketio
from color_detector import ColorDetector


class Server:
    ''' Simple AIOHTTP web server '''

    def __init__(self, host: str = "0.0.0.0", port: int = 8080) -> None:
        self.app_host = host
        self.app_port = port

        self.__app = None

    def __create_route_table(self) -> None:
        ''' Define all handlers 
            NOTE: Handlers defined first will be matched first (sorta FIFO) '''
        self.__route_table = web.RouteTableDef()

        # Serve static files
        self.__route_table.static("/", "../frontend")

        # Define additional routes here

        # Custom 404 Handler
        @self.__route_table.route("GET", "/{key:.+}")
        async def not_found_handler(request):
            return web.Response(status=404, text="404 - Not Found")

    async def setup(self) -> None:
        ''' Configure all server components '''
        self.__create_route_table()

        self.__app = web.Application()
        self.__sio = socketio.AsyncServer(async_mode='aiohttp')
        self.__sio.attach(self.__app)
        self.__app.router.add_routes(self.__route_table)

        # Event Handlers

        @self.__sio.event
        async def click_event(sid, data):
            color_detector = ColorDetector(data['img'], data['x'], data['y'])
            dominant_color = color_detector.background_color_caller()
            await self.__sio.emit('color_identified', dominant_color, to=sid)

        @self.__sio.on("*")
        async def all_callback(event, sid, data):
            print(event, data, sep=" |\t")

        self.__app_runner = web.AppRunner(self.__app)
        await self.__app_runner.setup()

    async def start(self) -> None:
        ''' Start the server '''
        if self.__app is None:
            await self.setup()

        self.__site = web.TCPSite(
            self.__app_runner, self.app_host, self.app_port)
        await self.__site.start()

    async def run(self) -> None:
        ''' Run the server indefinately '''
        await self.start()
        print("Server running at http://"+self.app_host +
              ":"+str(self.app_port)+"/index.html")

        while True:
            await asyncio.sleep(60)


if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    server = Server()

    try:
        loop.run_until_complete(server.run())
    except KeyboardInterrupt:
        loop.stop()
        loop.close()
