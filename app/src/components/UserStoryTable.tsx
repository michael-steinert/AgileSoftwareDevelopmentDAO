import { FunctionComponent, ReactElement, useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Contract } from 'ethers';

type UserStoryTableProps = {
  userStoryTreasury: Contract;
};

const UserStoryTable: FunctionComponent<UserStoryTableProps> = ({
  userStoryTreasury,
}: UserStoryTableProps): ReactElement => {
  const [allUserStories, setAllUserStories] = useState<IUserStory[]>([]);

  useEffect(() => {
    // Retrieving all existing User Stories, then store them into State
    const retrieveAllUserStories = async (
      userStoryTreasury: Contract
    ): Promise<void> => {
      // Fetching all User Stories

      const userStories = userStoryTreasury
        ? await userStoryTreasury.retrieveAllUserStories()
        : [];

      // Change all User Stories, if they changed
      if (allUserStories !== userStories) {
        setAllUserStories(userStories);
      }
    };
    retrieveAllUserStories(userStoryTreasury!).catch(console.error);

    // Listen on emitted Event to update the Data in Real-Time
    // Subscribe to Event Calling Listener when the Event `UserStoryCreated` occurs
    userStoryTreasury?.on(
      'UserStoryCreated',
      (
        creator: string,
        userStoryNumber: number,
        description: string,
        functionalComplexity: number,
        effortEstimation: number,
        timestamp: any,
        isDone: boolean
      ) => {
        // Set new User Story from Event
        setAllUserStories((previousUserStories: IUserStory[]) => {
          return [
            ...previousUserStories,
            {
              creator: creator,
              userStoryNumber: userStoryNumber,
              description: description,
              functionalComplexity: functionalComplexity,
              effortEstimation: effortEstimation,
              timestamp: new Date(timestamp * 1000),
              isDone: isDone,
            },
          ];
        });
      }
    );
  }, [userStoryTreasury]);

  return (
    <Box>
      {userStoryTreasury ? (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Creator</TableCell>
                <TableCell align='right'>UserStoryNumber</TableCell>
                <TableCell align='right'>Description</TableCell>
                <TableCell align='right'>FunctionalComplexity</TableCell>
                <TableCell align='right'>EffortEstimation</TableCell>
                <TableCell align='right'>Timestamp</TableCell>
                <TableCell align='right'>IsDone</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allUserStories &&
                allUserStories.map((userStory: IUserStory, index: number) => (
                  <TableRow
                    key={index}
                    sx={{
                      '&:last-child td, &:last-child th': {
                        border: 0,
                      },
                    }}
                  >
                    <TableCell component='th' scope='row'>
                      {userStory.creator}
                    </TableCell>
                    <TableCell align='right'>
                      {userStory.userStoryNumber}
                    </TableCell>
                    <TableCell align='right'>{userStory.description}</TableCell>
                    <TableCell align='right'>
                      {userStory.functionalComplexity}
                    </TableCell>
                    <TableCell align='right'>
                      {userStory.effortEstimation}
                    </TableCell>
                    <TableCell align='right'>{userStory.timestamp}</TableCell>
                    <TableCell align='right'>{userStory.isDone}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <em>{`<Smart Contract not for User Stories yet deployed>`}</em>
      )}
    </Box>
  );
};

export default UserStoryTable;
