import {
  SchemaRegistry,
  AvroKafka,
  AvroProducer,
  AvroConsumer,
  AvroEachMessagePayload,
  AvroBatch,
} from '../src';
import { Kafka, logLevel, Admin, CompressionTypes } from 'kafkajs';
import { retry } from 'ts-retry-promise';
import * as uuid from 'uuid';
import { Schema } from 'avsc';

interface MessageType {
  stringField: string;
  intField?: number | null;
}

const schema = {
  type: 'record',
  name: 'TestMessage',
  fields: [{ type: 'string', name: 'stringField' }, { type: ['null', 'int'], name: 'intField' }],
} as Schema;

const TOPIC_ALIAS = 'topic-alias';
const realTopicName = `dev_avroKafkajs_${uuid.v4()}`;

describe('Class', () => {
  let producer: AvroProducer;
  let consumer: AvroConsumer;
  let admin: Admin;
  let groupId: string;

  beforeEach(async () => {
    const schemaRegistry = new SchemaRegistry({ uri: 'http://localhost:8081' });
    const kafka = new Kafka({ brokers: ['localhost:29092'], logLevel: logLevel.NOTHING });

    const avroKafka = new AvroKafka(schemaRegistry, kafka, { [TOPIC_ALIAS]: realTopicName });
    groupId = uuid.v4();

    admin = avroKafka.admin();
    consumer = avroKafka.consumer({ groupId });
    producer = avroKafka.producer();
    await Promise.all([consumer.connect(), producer.connect(), admin.connect()]);
  });

  afterEach(() => Promise.all([consumer.disconnect(), producer.disconnect(), admin.disconnect()]));

  it('Should process avro messages one by one', async () => {
    jest.setTimeout(10000);
    const consumed: AvroEachMessagePayload<MessageType>[] = [];

    await admin.createTopics({ topics: [{ topic: realTopicName, numPartitions: 2 }] });
    await consumer.subscribe({ topic: TOPIC_ALIAS });
    await consumer.run<MessageType>({
      partitionsConsumedConcurrently: 2,
      eachMessage: async payload => {
        consumed.push(payload);
      },
    });

    await producer.send<MessageType>({
      topic: TOPIC_ALIAS,
      schema,
      messages: [
        { value: { intField: 10, stringField: 'test1' }, partition: 0, key: 'test-1' },
        { value: { intField: null, stringField: 'test2' }, partition: 1, key: 'test-2' },
      ],
    });

    const description = await consumer.describeGroup();
    expect(description).toMatchObject({ errorCode: 0, groupId });
    expect(consumer.paused()).toHaveLength(0);

    consumer.pause([{ topic: TOPIC_ALIAS }]);

    expect(consumer.paused()).toHaveLength(1);

    consumer.resume([{ topic: TOPIC_ALIAS }]);

    expect(consumer.paused()).toHaveLength(0);

    await retry(
      async () => {
        expect(consumed).toHaveLength(2);
        expect(consumed).toContainEqual(
          expect.objectContaining({
            partition: 0,
            message: expect.objectContaining({
              key: Buffer.from('test-1'),
              value: { intField: 10, stringField: 'test1' },
              schema,
            }),
          }),
        );
        expect(consumed).toContainEqual(
          expect.objectContaining({
            partition: 1,
            message: expect.objectContaining({
              key: Buffer.from('test-2'),
              value: { intField: null, stringField: 'test2' },
              schema,
            }),
          }),
        );
      },
      { delay: 1000, retries: 4 },
    );

    let stopped = false;
    consumer.on('consumer.stop', () => (stopped = true));
    await consumer.stop();

    await retry(async () => expect(stopped).toBe(true), { delay: 1000, timeout: 2000 });
  });

  it('Should process avro messages in batches', async () => {
    jest.setTimeout(10000);
    const consumed: AvroBatch<MessageType>[] = [];

    await admin.createTopics({ topics: [{ topic: realTopicName, numPartitions: 2 }] });
    await consumer.subscribe({ topic: TOPIC_ALIAS });
    await consumer.run<MessageType>({
      eachBatch: async payload => {
        consumed.push(payload.batch);
      },
    });

    await producer.sendBatch({
      acks: -1,
      timeout: 3000,
      compression: CompressionTypes.None,
      topicMessages: [
        {
          topic: TOPIC_ALIAS,
          schema,
          messages: [
            { value: { intField: 1, stringField: 'test1' }, partition: 0, key: 'test-1' },
            { value: { intField: 2, stringField: 'test2' }, partition: 0, key: 'test-2' },
            { value: { intField: 3, stringField: 'test3' }, partition: 0, key: 'test-3' },
            { value: { intField: null, stringField: 'test4' }, partition: 1, key: 'test-4' },
          ],
        },
      ],
    });

    await retry(
      async () => {
        expect(consumed).toHaveLength(2);

        expect(consumed).toContainEqual(
          expect.objectContaining({
            partition: 0,
            topic: realTopicName,
            messages: [
              expect.objectContaining({
                key: Buffer.from('test-1'),
                value: { intField: 1, stringField: 'test1' },
                schema,
              }),
              expect.objectContaining({
                key: Buffer.from('test-2'),
                value: { intField: 2, stringField: 'test2' },
                schema,
              }),
              expect.objectContaining({
                key: Buffer.from('test-3'),
                value: { intField: 3, stringField: 'test3' },
                schema,
              }),
            ],
          }),
        );

        expect(consumed).toContainEqual(
          expect.objectContaining({
            partition: 1,
            topic: realTopicName,
            messages: [
              expect.objectContaining({
                key: Buffer.from('test-4'),
                value: { intField: null, stringField: 'test4' },
              }),
            ],
          }),
        );
      },
      { delay: 1000, retries: 4 },
    );
  });
});
