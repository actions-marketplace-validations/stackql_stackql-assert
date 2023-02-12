const parseResult = (resultStr) =>{
    let parsedResult = resultStr;
    const registerPullPattern = /^[\w\s]+provider, version '.*' successfully installed\n\[.*\]$/;
    if(registerPullPattern.test(resultStr)){
    const lines = resultStr.split('\n')
    parseResult =  lines[1]
    }
    return JSON.parse(parsedResult)
   
}

const getExpectedResult = (expectedResultStr, expectedResultFilePath) =>{
    let expectedResult; 
    if(expectedResultStr){
        expectedResult  = parseResult(expectedResultStr)
    }
    else if(expectedResultFilePath){
        const content = require(expectedResultFilePath)
        expectedResult = parseResult(content)
    }

    return expectedResult
}

const checkResult= (expectedResult, expectedRows, actualResult) =>{
    let equality;

    if(expectedResult){
        equality = JSON.stringify(expectedResult) === JSON.stringify(actualResult)
        core.setFailed(`============ StackQL Assert Failed ============ \n
        Expected: ${JSON.stringify(expectedResult)} \n
        Actual: ${JSON.stringify(actualResult)}
        `)
    }
    else {
        equality = actualResult.length === expectedRows
        core.setFailed(`============ StackQL Assert Failed ============ \n
        Expected Number of Rows: ${expectedRows} \n
        Actual Number of Rows: ${actualResult.length}
        Execution Result: ${JSON.stringify(actualResult)}
        `)
    }
    return equality


}

module.exports = (core) =>{
    try{
        let execResultStr = core.getInput('result')
        let expectedResultStr = core.getInput('expected_result_str')
        let expectedResultFilePath = core.getInput('expected_result_file_path')
        let expectedRows = core.getInput('expected_rows')

        if(!expectedResultStr && !expectedResultFilePath && !expectedRows){
            core.setFailed('Cannot find expected result, file path or expected rows')
        }

        

        const expectedResult = getExpectedResult(execResultStr, expectedResultFilePath)
        

        const actualResult = JSON.parse(execResultStr)

        if(!actualResult){
            core.setFailed('No Output from executing query');
        }


        checkResult(expectedResult, expectedRows, actualResult)

        core.info('============ StackQL Assert Succeed ============ ')

      }catch(e){
        core.setFailed(e);
      }


}