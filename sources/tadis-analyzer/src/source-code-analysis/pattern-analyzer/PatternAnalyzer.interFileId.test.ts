import { System, AsyncEventFlow } from '../../model/ms'

import { verifyEachContentHasTransformer } from '../../test/verifiers'

import { PatternAnalyzer } from './PatternAnalyzer'
import {
  SystemPattern, NodePattern, SearchTextLocation
} from './model'

describe(PatternAnalyzer.name, () => {

  const sourceFolder = __dirname + '/testdata/inter-file-id-project'

  beforeEach(() => {
    process.env.NODE_ENV = 'test'
  })

  const ws = '\\s*'
  const id = '\\w+'

  function javaSourceFilePattern(): NodePattern {
    return {
      searchTextLocation: SearchTextLocation.FILE_PATH,
      regExp: '$sourceRoot/([^/]+)/source\.java',
      capturingGroupIndexForNodeName: 1,
      nodeType: 'MicroService'
    }
  }

  it('can resolve a name from the content of another file', async() => {
    const inputSystem = new System('test')

    const systemPattern: SystemPattern = {
      nodePatterns: [],
      edgePatterns: [
        {
          edgeType: 'AsyncEventFlow',
          sourceNodePattern: javaSourceFilePattern(),
          targetNodePattern: {
            searchTextLocation: SearchTextLocation.FILE_CONTENT,
            regExp: `"(.+_KAFKA_TOPIC)"`,
            capturingGroupIndexForNodeName: 1,
            nameResolution: {
              searchTextLocation: SearchTextLocation.ANY_FILE_CONTENT,
              regExp: `name:\\s*$name\\s*value:\\s*(\\w+)`
            },
            nodeType: 'MessageExchange'
          }
        }
      ]
    }

    const analyzer = new PatternAnalyzer(sourceFolder)
    const outputSystem = await analyzer.transform(inputSystem, systemPattern)

    expect(outputSystem.findMicroService('service1')).toBeDefined()
    expect(outputSystem.findMessageExchange('actual_topic_name')).toBeDefined()

    verifyEachContentHasTransformer(outputSystem, PatternAnalyzer.name)
  })
})