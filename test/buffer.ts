/*
 * Copyright 2018 The NATS Authors
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as NATS from '../src/nats';
import {NatsConnectionOptions} from '../src/nats';
import * as nsc from './support/nats_server_control';
import {Server} from './support/nats_server_control';
import {expect} from 'chai'

describe('Buffer', () => {

    let PORT = 1432;
    let server: Server;

    // Start up our own nats-server
    before((done) => {
        server = nsc.start_server(PORT, [], done);
    });

    // Shutdown our server
    after((done) => {
        nsc.stop_server(server, done);
    });

    it('should allow sending and receiving raw buffers', (done) => {
        let nc = NATS.connect({
            'url': 'nats://localhost:' + PORT,
            'preserveBuffers': true
        } as NatsConnectionOptions);

        let validBuffer = Buffer.from('foo-bar');

        nc.subscribe('validBuffer', {}, (msg) => {
            expect(msg).to.be.eql(validBuffer);
            nc.close();
            done();
        });

        nc.publish('validBuffer', validBuffer);
    });

    it('should allow parsing raw buffers to json', (done) => {
        let nc = NATS.connect({
            'url': 'nats://localhost:' + PORT,
            'preserveBuffers': true,
            'json': true
        } as NatsConnectionOptions);

        let jsonString = '{ "foo-bar": true }';
        let validBuffer = Buffer.from(jsonString);
        let obj = JSON.parse(jsonString);

        nc.subscribe('validBuffer', {}, (msg) => {
            expect(msg).to.be.eql(obj);
            nc.close();
            done();
        });

        nc.publish('validBuffer', validBuffer);
    });
});